// Adds custom jest-dom matchers (toBeInTheDocument, toHaveTextContent, …)
// to the components project (jsdom environment).
import "@testing-library/jest-dom";

// jsdom doesn't implement matchMedia; components that read the OS color-scheme
// preference (theme handling) need it stubbed.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
}
