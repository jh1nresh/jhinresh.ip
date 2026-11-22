#!/usr/bin/env python3
"""Exercise the Pages refresh against offline contribution calendars."""

from datetime import date, timedelta
import json
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest

from refresh_contributions import SITE_DATA, parse_calendar, refresh_artifact


TODAY = date(2026, 11, 25)
FIRST = TODAY - timedelta(days=364)
ROOT = Path(__file__).resolve().parents[1]


def calendar_html():
    cells = []
    for index in range(365):
        day = FIRST + timedelta(days=index)
        label = {0: 'No contributions', 1: '1,234 contributions', 364: '1 contribution'}.get(index, 'No contributions')
        cells.append(
            f'<td class="ContributionCalendar-day" data-date="{day}" id="day-{index}"></td>'
            f'<tool-tip for="day-{index}">{label} on a day.</tool-tip>'
        )
    # GitHub renders weekday rows first, rather than returning days in date order.
    return '<h2 id="js-contribution-activity-description"> 1,235 contributions in the last year </h2>' + ''.join(reversed(cells))


class RefreshTests(unittest.TestCase):
    def test_success_replaces_calendar_and_matching_labels(self):
        with TemporaryDirectory() as directory:
            artifact = Path(directory)
            index = artifact / 'index.html'
            data_file = artifact / 'site-data.json'
            original_html = (ROOT / index.name).read_text()
            index.write_text(original_html)
            data_file.write_text((ROOT / data_file.name).read_text())

            refresh_artifact(artifact, calendar_html(), TODAY)
            html = index.read_text()
            data = json.loads(SITE_DATA.search(html)[2])
            original = json.loads(SITE_DATA.search(original_html)[2])
            calendar = data['github']['contributionsCollection']['contributionCalendar']
            days = [day for week in calendar['weeks'] for day in week['contributionDays']]

            self.assertEqual(data, json.loads(data_file.read_text()))
            self.assertEqual(data['projects'], original['projects'])
            self.assertEqual(data['profile'], original['profile'])
            self.assertEqual(data['snapshotDate'], TODAY.isoformat())
            self.assertEqual(calendar['totalContributions'], 1235)
            self.assertEqual(len(days), 365)
            self.assertEqual(len(calendar['weeks'][0]['contributionDays']), 4)
            self.assertEqual(days[0], {'date': FIRST.isoformat(), 'contributionCount': 0})
            self.assertEqual(days[1]['contributionCount'], 1234)
            self.assertEqual(days[-1], {'date': TODAY.isoformat(), 'contributionCount': 1})
            self.assertIn('1,235 contributions ↗', html)
            self.assertIn('Nov 26, 2025 — Nov 25, 2026', html)

    def test_rejects_unusable_calendars(self):
        html = calendar_html()
        cases = [
            ('<title>Unavailable</title>', TODAY, 'Expected a year'),
            (html, TODAY + timedelta(days=2), 'ends on'),
            (html, TODAY - timedelta(days=1), 'ends on'),
            (html.replace(f'data-date="{FIRST}"', f'data-date="{FIRST + timedelta(days=1)}"'), TODAY, 'repeated date'),
            (html.replace('for="day-364"', 'for="unrelated"'), TODAY, 'invalid contribution count'),
            (html.replace('1,235 contributions', '1,236 contributions'), TODAY, 'total does not match'),
        ]
        for source, date_to_check, error in cases:
            with self.subTest(error=error), self.assertRaisesRegex(ValueError, error):
                parse_calendar(source, date_to_check)
        parse_calendar(html, TODAY + timedelta(days=1))

    def test_failed_refresh_leaves_artifact_untouched(self):
        with TemporaryDirectory() as directory:
            artifact = Path(directory)
            index = artifact / 'index.html'
            data_file = artifact / 'site-data.json'
            html = (ROOT / index.name).read_text().replace('id="contribution-total"', 'id="unexpected"')
            data = (ROOT / data_file.name).read_text()
            index.write_text(html)
            data_file.write_text(data)

            with self.assertRaisesRegex(ValueError, 'site template'):
                refresh_artifact(artifact, calendar_html(), TODAY)

            self.assertEqual(index.read_text(), html)
            self.assertEqual(data_file.read_text(), data)


if __name__ == '__main__':
    unittest.main()
