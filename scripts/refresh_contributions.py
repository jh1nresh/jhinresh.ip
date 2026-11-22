#!/usr/bin/env python3
"""Refresh the contribution calendar in the staged GitHub Pages artifact."""

from datetime import date, datetime, timedelta, timezone
from html.parser import HTMLParser
import json
from pathlib import Path
import re
from urllib.request import Request, urlopen


SOURCE = 'https://github.com/users/jh1nresh/contributions'
ARTIFACT = Path(__file__).resolve().parents[1] / '_site'
COUNT = r'(?:[0-9]{1,3}(?:,[0-9]{3})+|[0-9]+)'
SITE_DATA = re.compile(r'(<script id="site-data" type="application/json">)(.*?)(</script>)', re.S)


class ContributionParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.cells = {}
        self.labels = {}
        self.summary = []
        self.current_label = None
        self.in_summary = False

    def handle_starttag(self, tag, attrs):
        attributes = dict(attrs)
        if tag == 'td' and 'ContributionCalendar-day' in attributes.get('class', '').split():
            cell_id = attributes['id']
            if cell_id in self.cells:
                raise ValueError('Duplicate contribution cell')
            self.cells[cell_id] = date.fromisoformat(attributes['data-date'])
        elif tag == 'tool-tip':
            self.current_label = attributes.get('for')
            if self.current_label:
                if self.current_label in self.labels:
                    raise ValueError('Duplicate contribution label')
                self.labels[self.current_label] = []
        elif tag == 'h2' and attributes.get('id') == 'js-contribution-activity-description':
            self.in_summary = True

    def handle_endtag(self, tag):
        if tag == 'tool-tip':
            self.current_label = None
        elif tag == 'h2':
            self.in_summary = False

    def handle_data(self, data):
        if self.current_label:
            self.labels[self.current_label].append(data)
        if self.in_summary:
            self.summary.append(data)


def parse_calendar(html, today):
    parser = ContributionParser()
    parser.feed(html)
    parser.close()
    cells = sorted((day, cell_id) for cell_id, day in parser.cells.items())
    if len(cells) not in (365, 366):
        raise ValueError(f'Expected a year of contribution days, received {len(cells)}')
    first, last = cells[0][0], cells[-1][0]
    if last not in (today, today - timedelta(days=1)):
        raise ValueError(f'Contribution calendar ends on {last}, expected today or yesterday')

    weeks = []
    total = 0
    for offset, (day, cell_id) in enumerate(cells):
        if day != first + timedelta(days=offset):
            raise ValueError(f'Contribution calendar has a missing or repeated date near {day}')
        label = ''.join(parser.labels.get(cell_id, [])).strip()
        value = re.fullmatch(rf'(No|{COUNT}) contributions? on .+\.', label)
        if not value:
            raise ValueError(f'Missing or invalid contribution count for {day}')
        count = 0 if value[1] == 'No' else int(value[1].replace(',', ''))
        total += count
        if not weeks or day.weekday() == 6:  # GitHub weeks begin on Sunday.
            weeks.append({'contributionDays': []})
        weeks[-1]['contributionDays'].append({'date': day.isoformat(), 'contributionCount': count})

    summary = re.fullmatch(rf'({COUNT}|No) contributions? in the last year',
                           ' '.join(''.join(parser.summary).split()))
    if not summary or (0 if summary[1] == 'No' else int(summary[1].replace(',', ''))) != total:
        raise ValueError('GitHub contribution total does not match the daily counts')
    return {'totalContributions': total, 'weeks': weeks}, first, last


def replace_content(html, pattern, content):
    updated, matches = re.subn(pattern, lambda match: match[1] + content + match[3], html)
    if matches != 1:
        raise ValueError('Expected exactly one match for a contribution field in the site template')
    return updated


def refresh_artifact(artifact, source_html, today):
    calendar, first, last = parse_calendar(source_html, today)
    index = artifact / 'index.html'
    data_file = artifact / 'site-data.json'
    html = index.read_text(encoding='utf-8')
    embedded = SITE_DATA.search(html)
    if not embedded:
        raise ValueError('Missing site data in the packaged homepage')

    def update_data(data):
        data['github']['contributionsCollection']['contributionCalendar'] = calendar
        data['snapshotDate'] = today.isoformat()
        return data

    inline_data = update_data(json.loads(embedded[2]))
    external_data = update_data(json.loads(data_file.read_text(encoding='utf-8')))
    html = replace_content(html, SITE_DATA,
                           json.dumps(inline_data, ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c'))
    html = replace_content(html, r'(<a id="contribution-total"[^>]*>)([^<]*)(</a>)',
                           f'{calendar["totalContributions"]:,} contributions ↗')
    def format_date(day):
        return f'{day:%b} {day.day}, {day.year}'

    html = replace_content(html, r'(<p id="contribution-detail"[^>]*>)([^<]*)(</p>)',
                           f'{format_date(first)} — {format_date(last)} · Darker squares mean more contributions.')

    index.write_text(html, encoding='utf-8')
    data_file.write_text(json.dumps(external_data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Refreshed GitHub contributions: {calendar["totalContributions"]:,} from {first} to {last}')


def main():
    request = Request(SOURCE, headers={'Accept-Language': 'en-US'})
    with urlopen(request, timeout=20) as response:
        source_html = response.read(2_000_000).decode('utf-8')
    refresh_artifact(ARTIFACT, source_html, datetime.now(timezone.utc).date())


if __name__ == '__main__':
    main()
