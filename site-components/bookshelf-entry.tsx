import React from 'react';
import {createRoot, type Root} from 'react-dom/client';
import {Bookshelf, type BookshelfBook} from './upstream/components/ui/bookshelf';
const roots = new WeakMap<HTMLElement, Root>();
const api = {
  mount(element: HTMLElement, books: BookshelfBook[]) {
    element.classList.add('jhinresh-bookshelf');
    let root = roots.get(element);
    if (!root) { root = createRoot(element); roots.set(element, root); }
    root.render(<Bookshelf books={books} label="Bookshelf" defaultBookId="buffett" />);
    return () => { roots.get(element)?.unmount(); roots.delete(element); };
  }
};
(window as Window & {JhinreshBookshelf?: typeof api}).JhinreshBookshelf = api;
