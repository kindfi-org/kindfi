import type { JSX } from "react";
import { afterEach, expect, mock, test } from "bun:test";
import { cleanup, render, screen } from "@testing-library/react";
import { LearningPathsCard } from "../learningpaths/LearningPathCard";

import "./setupTests";

// Mock components
const mockIcon = mock((): JSX.Element => <span data-testid="mock-icon" />);

const mockLink = mock(
  ({
    href,
    children,
    className,
  }: {
    href: string;
    children: React.ReactNode;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  )
);

const mockCard = mock(
  ({
    children,
    className,
    ref,
  }: {
    children: React.ReactNode;
    className?: string;
    ref?: React.Ref<HTMLDivElement>;
  }) => (
    <div className={className} ref={ref} data-testid="mock-card">
      {children}
    </div>
  )
);

// Mock modules
mock.module("~/components/ui/icon", () => ({
  Icon: mockIcon as React.FC<{ name: string; className?: string }>,
}));

mock.module("next/link", () => ({
  __esModule: true,
  default: mockLink as React.FC<{
    href: string;
    children: React.ReactNode;
    className?: string;
  }>,
}));

mock.module("~/components/base/card", () => ({
  Card: mockCard,
}));

// Clean up after each test
afterEach(() => {
  cleanup();
  mockIcon.mockClear();
  mockLink.mockClear();
  mockCard.mockClear();
});

test("renders with all props correctly", () => {
  const props = {
    icon: "table2" as const,
    title: "Test Learning Path",
    description: "This is a test description",
    modules: 5,
    level: "Intermediate" as const,
    duration: "3 weeks" as const,
    cta: "/test-path",
    ctaColor: "green" as const,
  };

  const { getByText, getAllByText } = render(<LearningPathsCard {...props} />);

  // Check that all the important text appears on screen
  expect(getByText(props.title)).toBeTruthy();
  expect(getByText(props.description)).toBeTruthy();
  expect(getByText(`${props.modules} Modules`)).toBeTruthy();
  expect(getByText(props.level)).toBeTruthy();
  expect(getByText(props.duration)).toBeTruthy();

  // Verify the "Start This Path" button exists
  const buttons = getAllByText(/Start This Path/i);
  expect(buttons.length).toBeGreaterThan(0);

  expect(mockIcon).toHaveBeenCalled();
  const iconCall = mockIcon.mock.calls[0] as unknown as [{ name: string }];
  expect(iconCall[0].name).toBe(props.icon);

  // Check the link goes to the right place
  expect(mockLink).toHaveBeenCalled();
  expect(mockLink.mock.calls[0][0].href).toBe(props.cta);
});

test("applies correct color theme for green CTA", () => {
  const props = {
    icon: "table2" as const,
    title: "Green Theme Path",
    description: "Test",
    modules: 3,
    level: "Beginner" as const,
    duration: "2 weeks" as const,
    cta: "/green-path",
    ctaColor: "green" as const,
  };

  render(<LearningPathsCard {...props} />);

  const title = screen.getByText(props.title);
  expect(title.classList.contains("text-green-600")).toBe(true);

  // Check that the Link component was called with the correct class
  expect(mockLink).toHaveBeenCalled();
  const linkCall = mockLink.mock.calls[0][0];
  const gradientClasses = ["bg-gradient-to-r", "from-green-400", "to-black"];
  for (const cls of gradientClasses) {
    expect(linkCall.className).toContain(cls);
  }
});

test("applies correct color theme for blue CTA", () => {
  const props = {
    icon: "zap" as const,
    title: "Blue Theme Path",
    description: "Test",
    modules: 4,
    level: "Advanced" as const,
    duration: "4 weeks" as const,
    cta: "/blue-path",
    ctaColor: "blue" as const,
  };

  const { getByText } = render(<LearningPathsCard {...props} />);

  // The title should be blue
  const title = getByText(props.title);
  expect(title.classList.contains("text-blue-500")).toBe(true);

  // Check that the Link component was called with the correct class
  expect(mockLink).toHaveBeenCalled();
  const linkCall = mockLink.mock.calls[0][0];
  expect(linkCall.className).toContain("bg-blue-500");
});

test("forwards ref correctly", () => {
  const props = {
    icon: "table2" as const,
    title: "Ref Test",
    description: "Test",
    modules: 1,
    level: "All Levels" as const,
    duration: "2 weeks" as const,
    cta: "/ref-test",
    ctaColor: "blue" as const,
  };

  // Create a fake ref object to track
  const refMock = { current: null };
  render(<LearningPathsCard ref={refMock} {...props} />);

  expect(mockCard).toHaveBeenCalled();
  // Check that the ref was passed to the Card component
  expect(mockCard.mock.calls[0][0].ref).toBe(refMock);
});

test("memoization works correctly", () => {
  const props = {
    icon: "table2" as const,
    title: "Memo Test",
    description: "Test",
    modules: 2,
    level: "Intermediate" as const,
    duration: "3 weeks" as const,
    cta: "/memo-test",
    ctaColor: "green" as const,
  };

  const { rerender } = render(<LearningPathsCard {...props} />);
  const initialCallCount = mockCard.mock.calls.length;

  // Re-render with same props - should use memoized version
  rerender(<LearningPathsCard {...props} />);
  expect(mockCard.mock.calls.length).toBe(initialCallCount);

  // Re-render with changed props - should update
  rerender(<LearningPathsCard {...props} title="Changed Title" />);
  expect(mockCard.mock.calls.length).toBe(initialCallCount + 1);
});
