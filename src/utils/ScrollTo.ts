export default function ScrollTo(
  targetId: string,
  options?: { offset?: number; center?: boolean }
) {
  const { offset = 0, center = false } = options || {};
  const element = document.getElementById(targetId);
  if (!element) return;

  const elementRect = element.getBoundingClientRect();
  const elementTop = elementRect.top + window.scrollY;

  let scrollTarget = elementTop - offset;

  if (center) {
    const viewportHeight = window.innerHeight;
    const elementHeight = elementRect.height;
    const centerOffset = (viewportHeight - elementHeight) / 2;
    scrollTarget = elementTop - centerOffset;
  }

  window.scrollTo({
    top: scrollTarget,
    behavior: "smooth",
  });
}
