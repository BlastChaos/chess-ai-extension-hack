import { Position } from "@chess-ai/ai";

type Props = {
  from: Position;
  to: Position;
};
export function move(props: Props): boolean {
  const srcClass = `square-${props.from.x}${props.from.y}`;
  const srcEl = document.getElementsByClassName(srcClass)[0] as
    | HTMLElement
    | undefined;

  if (!srcEl) {
    console.error("Source square element not found:", srcClass);
    return false;
  }

  // fire-and-forget async so signature remains boolean
  (async () => {
    try {
      const boardEl = findBoardElement(srcEl);
      const boardRect = boardEl ? boardEl.getBoundingClientRect() : null;

      const start = centerOf(srcEl);

      // compute deltas in squares (could be negative)
      const dxSquares = props.to.x - props.from.x;
      const dySquares = props.to.y - props.from.y;

      // compute end coords by snapping to grid derived from boardRect or srcEl size
      const { endPoint, dropTarget } = computeEndPointAndTarget({
        start,
        boardRect,
        srcEl,
        dxSquares,
        dySquares,
        boardEl,
      });

      // prefer boardEl or canvas as the element to receive movement events
      const moveDispatchTarget = (document.querySelector("canvas") ||
        boardEl ||
        document) as Element | Document;

      // use srcEl as the element to receive the initial down event (some sites require mousedown on piece)
      await simulateDragWithPoints(
        moveDispatchTarget,
        start,
        endPoint,
        srcEl,
        dropTarget
      );
    } catch (err) {
      console.error("move() simulation failed:", err);
    }
  })();

  return true;
}

/* -------------------------
   Helpers
   ------------------------- */

type Point = { x: number; y: number };

// small utility delay
function delay(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

function centerOf(elem: Element): Point {
  const r = (elem as HTMLElement).getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
}

/**
 * Try to find board element (canvas or wrapper). Fall back conservatively to the nearest ancestor
 * or the document body.
 */
function findBoardElement(srcEl: Element | null): Element | null {
  if (!srcEl)
    return (
      document.querySelector("canvas") ||
      document.querySelector(".board") ||
      document.body
    );

  // common board selectors
  const selectors = [
    "canvas",
    ".board",
    ".board-wrap",
    ".board-layout",
    ".chessboard",
    ".board--component",
    ".board-wrap--board",
  ];

  for (const sel of selectors) {
    const q = document.querySelector(sel);
    if (q) return q;
  }

  // try closest ancestor with a width that's divisible by 8-ish
  let p: Element | null = srcEl;
  while (p && p !== document.body) {
    const r = (p as HTMLElement).getBoundingClientRect();
    if (r.width > 0 && Math.abs(Math.round(r.width / 8) * 8 - r.width) < 20)
      return p;
    p = p.parentElement;
  }

  return document.querySelector("canvas") || document.body;
}

/**
 * Detect whether board is visually flipped (black orientation).
 * checks: class containing 'flip'/'flipped', dataset.flipped, or computed transform rotate(180deg)
 */
function detectFlipped(boardEl: Element | null): boolean {
  if (!boardEl) return false;
  try {
    const cls = boardEl.className || "";
    if (typeof cls === "string" && /flip|flipped|rotated/i.test(cls))
      return true;
    const df = (boardEl as any).dataset;
    if (df && (df.flipped === "true" || df.orientation === "black"))
      return true;
    const cs = window.getComputedStyle(boardEl);
    const transform =
      cs.getPropertyValue("transform") ||
      cs.getPropertyValue("-webkit-transform");
    if (transform && transform !== "none" && /matrix|rotate/.test(transform)) {
      if (transform.includes("180") || transform.includes("rotate(180"))
        return true;
    }
  } catch (e) {
    // ignore
  }
  return false;
}

interface ComputeEndResult {
  endPoint: Point;
  dropTarget: Element | Document | null;
}

/**
 * Compute destination center point and attempt to get elementFromPoint at that location.
 * If elementFromPoint returns null or outside the board, snap to nearest square center.
 */
function computeEndPointAndTarget(opts: {
  start: Point;
  boardRect: DOMRect | null;
  srcEl: Element;
  dxSquares: number;
  dySquares: number;
  boardEl: Element | null;
}): ComputeEndResult {
  const { start, boardRect, srcEl, dxSquares, dySquares, boardEl } = opts;

  // If we have a valid boardRect, derive square size from its width or height
  let squareSize = 0;
  let originX = 0;
  let originY = 0;
  let flipped = false;

  if (boardRect && boardRect.width > 0 && boardRect.height > 0) {
    // prefer width to compute square size — board may be non-square but chess boards are square; use average
    squareSize = Math.max(
      1,
      Math.min(boardRect.width / 8, boardRect.height / 8)
    );
    originX = boardRect.left;
    originY = boardRect.top;
    flipped = detectFlipped(boardEl);
  } else {
    // fallback: use srcEl size as square size
    const r = (srcEl as HTMLElement).getBoundingClientRect();
    squareSize = Math.max(1, (r.width + r.height) / 2);
    originX = r.left - r.width * (propsFileIndex(srcEl) ?? 0); // best-effort; will be clamped later
    originY = r.top - r.height * (propsRankIndex(srcEl) ?? 0);
    flipped = false;
  }

  // infer src square indices from start coordinates and origin
  let srcFileIdx = Math.floor((start.x - originX) / squareSize);
  let srcRankIdx = Math.floor((start.y - originY) / squareSize);

  // clamp (safety)
  srcFileIdx = clamp(srcFileIdx, 0, 7);
  srcRankIdx = clamp(srcRankIdx, 0, 7);

  // if board is flipped, our file/rank index counting is reversed
  if (flipped) {
    srcFileIdx = 7 - srcFileIdx;
    srcRankIdx = 7 - srcRankIdx;
  }

  // compute destination indices
  let destFileIdx = clamp(srcFileIdx + dxSquares, 0, 7);
  let destRankIdx = clamp(srcRankIdx - dySquares, 0, 7);

  // if flipped, convert back to screen coords accordingly
  let endX =
    originX +
    (flipped ? 7 - destFileIdx + 0.5 : destFileIdx + 0.5) * squareSize;
  let endY =
    originY +
    (flipped ? 7 - destRankIdx + 0.5 : destRankIdx + 0.5) * squareSize;

  // try elementFromPoint first
  const dropCandidate = document.elementFromPoint(
    Math.round(endX),
    Math.round(endY)
  ) as Element | null;

  if (!dropCandidate || (boardEl && !boardEl.contains(dropCandidate))) {
    // If no suitable drop element found, make sure we're exactly at the square center (snapped).
    // Also clamp end coords to boardRect if available.
    if (boardRect) {
      endX = clamp(
        endX,
        boardRect.left + squareSize / 2,
        boardRect.right - squareSize / 2
      );
      endY = clamp(
        endY,
        boardRect.top + squareSize / 2,
        boardRect.bottom - squareSize / 2
      );
    }
    // refresh dropCandidate
    const fallbackCandidate = document.elementFromPoint(
      Math.round(endX),
      Math.round(endY)
    ) as Element | null;
    return {
      endPoint: { x: endX, y: endY },
      dropTarget: fallbackCandidate || boardEl || document,
    };
  }

  return {
    endPoint: { x: endX, y: endY },
    dropTarget: dropCandidate || boardEl || document,
  };
}

// small helpers used above
function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

/**
 * Best-effort: find file index of srcEl if its class contains coordinates like square-34 etc.
 * returns undefined if it can't deduce.
 */
function propsFileIndex(el: Element): number | undefined {
  const cls = el.className || "";
  const m = cls.toString().match(/square-?(\d)(\d)/);
  if (m) {
    const file = parseInt(m[1], 10);
    // file in that pattern is ambiguous; return file-1 maybe
    return Math.max(0, Math.min(7, file - 1));
  }
  return undefined;
}
function propsRankIndex(el: Element): number | undefined {
  const cls = el.className || "";
  const m = cls.toString().match(/square-?(\d)(\d)/);
  if (m) {
    const rank = parseInt(m[2], 10);
    return Math.max(0, Math.min(7, rank - 1));
  }
  return undefined;
}

/* -------------------------
   Event dispatch (pointer + mouse)
   ------------------------- */

function makePointerEvent(
  type: string,
  x: number,
  y: number,
  options: Partial<PointerEventInit> = {}
) {
  const init: PointerEventInit = {
    bubbles: true,
    cancelable: true,
    composed: true,
    clientX: Math.round(x),
    clientY: Math.round(y),
    screenX: Math.round(x),
    screenY: Math.round(y),
    pointerId: 1,
    pointerType: "mouse",
    isPrimary: true,
    buttons: 1,
    pressure: 0.5,
    ...options,
  };
  return new PointerEvent(type, init);
}
function makeMouseEvent(
  type: string,
  x: number,
  y: number,
  options: Partial<MouseEventInit> = {}
) {
  const init: MouseEventInit = {
    bubbles: true,
    cancelable: true,
    composed: true,
    clientX: Math.round(x),
    clientY: Math.round(y),
    screenX: Math.round(x),
    screenY: Math.round(y),
    button: 0,
    buttons: 1,
    ...options,
  };
  return new MouseEvent(type, init);
}

function dispatchEventOn(target: EventTarget, ev: Event) {
  try {
    (target as Element | Document).dispatchEvent(ev);
  } catch (e) {
    // swallow
  }
}

async function fireDown(target: EventTarget, p: Point) {
  dispatchEventOn(target, makePointerEvent("pointerdown", p.x, p.y));
  dispatchEventOn(target, makeMouseEvent("mousedown", p.x, p.y));
}

async function fireMove(target: EventTarget, p: Point) {
  dispatchEventOn(target, makePointerEvent("pointermove", p.x, p.y));
  dispatchEventOn(target, makeMouseEvent("mousemove", p.x, p.y));
}

async function fireUp(target: EventTarget, p: Point) {
  dispatchEventOn(target, makePointerEvent("pointerup", p.x, p.y));
  dispatchEventOn(target, makeMouseEvent("mouseup", p.x, p.y));
  // send click as some boards rely on it after drop
  dispatchEventOn(target, makeMouseEvent("click", p.x, p.y));
}

/**
 * Simulate a drag by issuing a sequence of events on the given target (usually document or board/canvas).
 * If dropTarget is provided, we will `mouseup` on dropTarget; otherwise we use the movement target.
 */
async function simulateDragWithPoints(
  targetElem: Element | Document,
  start: Point,
  end: Point,
  srcElement?: Element,
  dropTarget?: Element | Document | null
) {
  const docTarget: EventTarget = targetElem || document;
  const downTarget: EventTarget = srcElement || docTarget;
  const upTarget: EventTarget = dropTarget || docTarget;

  // initial hover and press on the piece/downTarget
  await fireMove(downTarget, start);
  await delay(8);
  await fireDown(downTarget, start);
  await delay(30);

  // interpolate moves — number of steps depends on pixel distance
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.hypot(dx, dy);
  const steps = Math.min(10, Math.max(3, Math.round(distance / 30)));

  for (let i = 1; i <= steps; i++) {
    const t = i / (steps + 1);
    const mid = {
      x: Math.round(start.x + dx * t),
      y: Math.round(start.y + dy * t),
    };
    // dispatch moves to document/board element (where listeners usually are)
    await fireMove(docTarget, mid);
    await delay(12);
  }

  // final move and release
  await fireMove(docTarget, end);
  await delay(20);
  await fireUp(upTarget, end);
}
