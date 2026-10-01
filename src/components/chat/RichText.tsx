import "./rich-text.css";
import { Fragment, type ReactNode } from 'react';

/**
 * Renders the small slice of Markdown a language model actually produces.
 *
 * The chat used to render replies as plain text split on blank lines. That is
 * fine until the model answers a pricing question, at which point the reader is
 * shown `### 📊 **Σύνοψη Πακέτων** | **BASIC** (€60) | ...` — the literal
 * source of a table, as one grey wall. The information was correct and the
 * presentation made it unreadable.
 *
 * There were two ways out. Forbid structure in the system prompt and hope every
 * provider obeys, or render the structure. Only the second one is true whatever
 * the model does, and a comparison table is genuinely the right shape for
 * "what do the packages include" — so the answer is to draw it properly.
 *
 * Deliberately not a Markdown library. This produces React elements, never HTML
 * strings, so there is no `dangerouslySetInnerHTML` anywhere in the path and no
 * sanitiser to get wrong: an injected `<script>` in a reply is text, and renders
 * as text. Link targets are scheme-checked for the same reason — a model that
 * has been talked into emitting `javascript:` gets an inert span.
 */

/** Only these schemes may become a real anchor. */
const SAFE_SCHEME = /^(https?:|mailto:)/i;

const isSafeHref = (href: string): boolean => {
  const value = href.trim();
  if ((value.startsWith('/') && !value.startsWith('//') && !value.includes('\\')) || value.startsWith('#')) return true;
  return SAFE_SCHEME.test(value);
};

/**
 * Inline spans, resolved in one pass so that nesting cannot mis-order: each
 * alternative captures its own delimiters and the remainder recurses.
 */
const INLINE = /(\*\*|__)(.+?)\1|(\*|_)(?!\s)(.+?)(?<!\s)\3|`([^`]+?)`|\[([^\]]+)\]\(([^)\s]+)\)|(\bhttps?:\/\/[^\s<>()]+)/s;

const renderInline = (text: string, keyPrefix: string): ReactNode[] => {
  const nodes: ReactNode[] = [];
  let rest = text;
  let index = 0;

  while (rest.length > 0) {
    const match = INLINE.exec(rest);
    if (!match || match.index === undefined) {
      nodes.push(rest);
      break;
    }

    if (match.index > 0) nodes.push(rest.slice(0, match.index));

    const key = `${keyPrefix}-i${index++}`;
    const [, , strong, , emphasis, code, linkText, linkHref, bareUrl] = match;

    if (strong !== undefined) {
      nodes.push(<strong key={key}>{renderInline(strong, key)}</strong>);
    } else if (emphasis !== undefined) {
      nodes.push(<em key={key}>{renderInline(emphasis, key)}</em>);
    } else if (code !== undefined) {
      nodes.push(<code key={key}>{code}</code>);
    } else if (linkText !== undefined && linkHref !== undefined) {
      nodes.push(
        isSafeHref(linkHref)
          ? <a key={key} href={linkHref} rel="noreferrer noopener" target="_blank">{linkText}</a>
          : <span key={key}>{linkText}</span>,
      );
    } else if (bareUrl !== undefined) {
      nodes.push(
        <a key={key} href={bareUrl} rel="noreferrer noopener" target="_blank">
          {bareUrl.replace(/^https?:\/\//, '')}
        </a>,
      );
    }

    rest = rest.slice(match.index + match[0].length);
  }

  return nodes;
};

/** `| a | b |` split into cells, tolerating the optional outer pipes. */
const tableCells = (line: string): string[] =>
  line.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map((cell) => cell.trim());

const isTableRow = (line: string): boolean => line.includes('|') && /\|/.test(line.trim());

/** The `|---|:--:|` rule that turns the line above it into a header. */
const isTableRule = (line: string): boolean =>
  /^\s*\|?[\s:|-]*-[\s:|-]*\|?\s*$/.test(line) && line.includes('-') && line.includes('|');

const HEADING = /^(#{1,6})\s+(.*)$/;
const BULLET = /^\s*[-*•]\s+(.*)$/;
const ORDERED = /^\s*(\d{1,3})[.)]\s+(.*)$/;
const QUOTE = /^\s*>\s?(.*)$/;
const RULE = /^\s*([-*_])\1{2,}\s*$/;

type Block =
  | { kind: 'paragraph'; lines: string[] }
  | { kind: 'heading'; level: number; text: string }
  | { kind: 'bullets'; items: string[] }
  | { kind: 'ordered'; items: string[] }
  | { kind: 'quote'; lines: string[] }
  | { kind: 'rule' }
  | { kind: 'table'; head: string[] | null; rows: string[][] };

/** Groups the reply into blocks before anything is turned into an element. */
export const parseBlocks = (source: string): Block[] => {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const blocks: Block[] = [];
  let index = 0;

  const last = () => blocks[blocks.length - 1];

  while (index < lines.length) {
    const line = lines[index];

    if (line.trim() === '') {
      // A blank line only ever ends the block it follows.
      if (last()?.kind === 'paragraph' || last()?.kind === 'quote') blocks.push({ kind: 'paragraph', lines: [] });
      index += 1;
      continue;
    }

    if (RULE.test(line)) {
      blocks.push({ kind: 'rule' });
      index += 1;
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      blocks.push({ kind: 'heading', level: heading[1].length, text: heading[2].trim() });
      index += 1;
      continue;
    }

    // A table is claimed only when a pipe row is followed by the dashed rule,
    // or when we are already inside one. Otherwise a sentence that happens to
    // contain a pipe would be silently eaten.
    if (isTableRow(line) && isTableRule(lines[index + 1] ?? '')) {
      const head = tableCells(line);
      const rows: string[][] = [];
      index += 2;
      while (index < lines.length && isTableRow(lines[index]) && lines[index].trim() !== '') {
        rows.push(tableCells(lines[index]));
        index += 1;
      }
      blocks.push({ kind: 'table', head, rows });
      continue;
    }

    const bullet = BULLET.exec(line);
    if (bullet) {
      const current = last();
      if (current?.kind === 'bullets') current.items.push(bullet[1]);
      else blocks.push({ kind: 'bullets', items: [bullet[1]] });
      index += 1;
      continue;
    }

    const ordered = ORDERED.exec(line);
    if (ordered) {
      const current = last();
      if (current?.kind === 'ordered') current.items.push(ordered[2]);
      else blocks.push({ kind: 'ordered', items: [ordered[2]] });
      index += 1;
      continue;
    }

    const quote = QUOTE.exec(line);
    if (quote) {
      const current = last();
      if (current?.kind === 'quote') current.lines.push(quote[1]);
      else blocks.push({ kind: 'quote', lines: [quote[1]] });
      index += 1;
      continue;
    }

    const current = last();
    if (current?.kind === 'paragraph') current.lines.push(line.trim());
    else blocks.push({ kind: 'paragraph', lines: [line.trim()] });
    index += 1;
  }

  return blocks.filter((block) => !(block.kind === 'paragraph' && block.lines.length === 0));
};

/**
 * How a table is drawn depends on how wide it is, because the container is
 * fixed and narrow — roughly 500px in the concierge panel — and a table cannot
 * be made narrower than the facts in it.
 *
 *   2 columns  a list of facts. Label left, value right, nothing to scroll.
 *   3 columns  a real table. This is the useful case: one feature column and
 *              two plans, side by side, which is what comparison means.
 *   4+ columns transposed into one block per plan. A four-column comparison
 *              is about 700px of content in a 500px panel; left as a table it
 *              clipped the last plan off the edge, which is how the reader was
 *              shown a comparison missing one of the things compared.
 *
 * Horizontal scrolling was the other option and is worse: a scrollbar inside a
 * message bubble is close to invisible, so the missing column stays missing —
 * the reader has to discover it before they can be told about it.
 */
const COMPARISON_FITS = 3;

const isDefinitionShaped = (head: string[] | null, rows: string[][]): boolean =>
  rows.length > 0 && rows.every((row) => row.length === 2) && (head === null || head.length === 2);

const widestRow = (head: string[] | null, rows: string[][]): number =>
  Math.max(head?.length ?? 0, ...rows.map((row) => row.length));

export const RichText = ({ content, className }: { content: string; className?: string }) => {
  const blocks = parseBlocks(content);

  return (
    <div className={className ? `rich-text ${className}` : 'rich-text'}>
      {blocks.map((block, blockIndex) => {
        const key = `b${blockIndex}`;

        switch (block.kind) {
          case 'rule':
            return <hr key={key} className="rich-text__rule" />;

          case 'heading':
            return (
              <p key={key} className="rich-text__heading" data-level={Math.min(block.level, 3)}>
                {renderInline(block.text, key)}
              </p>
            );

          case 'bullets':
            return (
              <ul key={key} className="rich-text__list">
                {block.items.map((item, itemIndex) => (
                  <li key={`${key}-${itemIndex}`}>{renderInline(item, `${key}-${itemIndex}`)}</li>
                ))}
              </ul>
            );

          case 'ordered':
            return (
              <ol key={key} className="rich-text__list rich-text__list--ordered">
                {block.items.map((item, itemIndex) => (
                  <li key={`${key}-${itemIndex}`}>{renderInline(item, `${key}-${itemIndex}`)}</li>
                ))}
              </ol>
            );

          case 'quote':
            return (
              <blockquote key={key} className="rich-text__quote">
                {renderInline(block.lines.join(' '), key)}
              </blockquote>
            );

          case 'table': {
            const { head, rows } = block;

            if (isDefinitionShaped(head, rows)) {
              return (
                <dl key={key} className="rich-text__facts">
                  {rows.map((row, rowIndex) => (
                    <Fragment key={`${key}-${rowIndex}`}>
                      <dt>{renderInline(row[0], `${key}-${rowIndex}-t`)}</dt>
                      <dd>{renderInline(row[1], `${key}-${rowIndex}-d`)}</dd>
                    </Fragment>
                  ))}
                </dl>
              );
            }

            /*
             * Too wide to compare side by side, so it is compared one column
             * at a time: each plan becomes a block headed by its own name,
             * carrying the same rows. Nothing is dropped and nothing is
             * pushed off the edge.
             */
            if (head && widestRow(head, rows) > COMPARISON_FITS) {
              return (
                <div key={key} className="rich-text__columns">
                  {head.slice(1).map((columnName, columnIndex) => (
                    <section key={`${key}-c${columnIndex}`}>
                      {/* A paragraph, not an <h4>: the same reason the
                          heading block is one. Nothing a model writes may
                          enter the page's heading outline. */}
                      <p className="rich-text__columns-title">
                        {renderInline(columnName, `${key}-c${columnIndex}`)}
                      </p>
                      <dl>
                        {rows.map((row, rowIndex) => (
                          <Fragment key={`${key}-c${columnIndex}r${rowIndex}`}>
                            <dt>{renderInline(row[0] ?? '', `${key}-c${columnIndex}r${rowIndex}t`)}</dt>
                            <dd>
                              {renderInline(row[columnIndex + 1] ?? '—', `${key}-c${columnIndex}r${rowIndex}d`)}
                            </dd>
                          </Fragment>
                        ))}
                      </dl>
                    </section>
                  ))}
                </div>
              );
            }

            return (
              // The wrapper, not the table, carries the overflow: a table that
              // is still a little wide scrolls inside the message rather than
              // widening the panel. Focusable and labelled, because a region
              // that scrolls must be reachable without a pointer.
              <div
                key={key}
                className="rich-text__table-scroll"
                role="region"
                tabIndex={0}
                aria-label={head ? head.join(', ') : undefined}
              >
                <table className="rich-text__table">
                  {head && (
                    <thead>
                      <tr>
                        {head.map((cell, cellIndex) => (
                          <th key={`${key}-h${cellIndex}`} scope="col">{renderInline(cell, `${key}-h${cellIndex}`)}</th>
                        ))}
                      </tr>
                    </thead>
                  )}
                  <tbody>
                    {rows.map((row, rowIndex) => (
                      <tr key={`${key}-r${rowIndex}`}>
                        {row.map((cell, cellIndex) => (
                          <td key={`${key}-r${rowIndex}c${cellIndex}`}>
                            {renderInline(cell, `${key}-r${rowIndex}c${cellIndex}`)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          }

          case 'paragraph':
          default:
            return (
              <p key={key} className="rich-text__paragraph">
                {renderInline(block.lines.join(' '), key)}
              </p>
            );
        }
      })}
    </div>
  );
};

export default RichText;
