import { Box, measureElement, Text, useInput, useFocus } from "ink";
import type { DOMElement } from "ink";
import { useEffect, useRef, useState } from "react";
import type { ComponentProps, ReactNode } from "react";
import { TabFrame } from "./tab-frame";

type SelectScrollBoxProps<T> = {
  height: number;
  items: T[];
  itemToString: (item: T) => string;
  itemToMetaString?: (item: T) => string;
  isSelected: (item: T) => boolean;
  onChange: (item: T, isSelected: boolean) => void;
  themeColor?: string;
  filter?: string;
  title?: string;
};

export default function SelectScrollBox<T>({
  height,
  items,
  itemToString,
  itemToMetaString,
  onChange,
  isSelected,
  themeColor = "green",
  filter,
  title,
}: SelectScrollBoxProps<T>) {
  const [marginTop, setMarginTop] = useState(0);
  const innerRef = useRef<DOMElement>(null);
  const outerRef = useRef<DOMElement>(null);

  const [visibleHeight, setVisibleHeight] = useState(0);
  const [contentHeight, setContentHeight] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const { isFocused } = useFocus({ autoFocus: true });
  const visibleItems =
    filter === undefined || filter === ""
      ? items
      : items.filter?.((item) => {
          return (
            itemToString(item).toLowerCase().indexOf(filter.toLowerCase()) >= 0
          );
        });

  useEffect(() => {
    if (innerRef.current && outerRef.current) {
      setVisibleHeight(measureElement(outerRef.current).height);
      setContentHeight(measureElement(innerRef.current).height);
    }
  }, [items.length]);

  function handleSelect(item: T) {
    onChange?.(item, !isSelected(item));
  }
  useInput((_input, key) => {
    if (!isFocused) {
      return;
    }

    const minMarginTop = visibleHeight - contentHeight;
    const listHeight = visibleHeight - 2; // 1 for scrollbar
    if (key.downArrow) {
      // Only move view down if selector pass the half-way point
      if (activeIndex > listHeight / 2) {
        setMarginTop((prev) => Math.max(prev - 1, minMarginTop));
      }
      setActiveIndex((prev) => Math.min(prev + 1, items.length - 1));
    }
    if (key.upArrow) {
      // Only move view up if selector pass the half-way point
      if (activeIndex < Math.abs(marginTop) + listHeight / 2) {
        // if (items.length - activeIndex > listHeight / 2) {
        setMarginTop((prev) => Math.min(prev + 1, 0));
      }
      setActiveIndex((prev) => Math.max(prev - 1, 0));
    }

    if (key.return) {
      // select item
      if (visibleItems[activeIndex]) {
        handleSelect(visibleItems[activeIndex]);
      }
    }
  });

  // scrollbar sizing
  const scrollbarHeight = Math.min(
    Math.round((visibleHeight / contentHeight) * visibleHeight),
    visibleHeight,
  );
  // scrollbar top position
  const contentScrollableDist = contentHeight - visibleHeight;
  const scrollbarScrollableDist = visibleHeight - scrollbarHeight;
  const scrollProgress = Math.abs(marginTop) / contentScrollableDist;
  const scrollbarTop = Math.round(scrollProgress * scrollbarScrollableDist);

  return (
    <TabFrame
      title={title}
      height={height}
      isFocused={isFocused}
      helpText="Use ↑↓ to navigate, ↵ to select"
      justifyContent="space-between"
    >
      <Box ref={outerRef} flexDirection="column" overflow="hidden">
        <Box
          ref={innerRef}
          flexDirection="column"
          marginTop={marginTop}
          flexShrink={0}
        >
          {visibleItems.map((item, index) => (
            <SelectItem
              themeColor={themeColor}
              key={`${index}-${itemToString(item)}`}
              isActive={index === activeIndex}
              isSelected={isSelected(item)}
              meta={itemToMetaString?.(item)}
            >
              <Text>{itemToString(item)}</Text>
            </SelectItem>
          ))}
        </Box>
      </Box>
      {visibleHeight < contentHeight && (
        <Box
          height="100%"
          width={3}
          borderStyle="single"
          borderColor={themeColor}
          borderRight={false}
          borderTop={false}
          borderBottom={false}
        >
          <Box
            backgroundColor={themeColor}
            width={2}
            height={scrollbarHeight}
            marginTop={scrollbarTop}
            borderStyle="round"
            borderColor="whiteBright"
          />
        </Box>
      )}
    </TabFrame>
  );
}

function SelectItem({
  isActive,
  isSelected,
  children,
  themeColor = "green",
  meta,
}: {
  isActive?: boolean;
  isSelected?: boolean;
  children: ReactNode;
  themeColor: string;
  meta?: string;
}) {
  return (
    <Box flexDirection="row" gap={1} width="100%">
      <Box width={2}>
        {isActive && (
          <Text bold color={themeColor}>
            »
          </Text>
        )}
      </Box>
      <SelectItemBullet isSelected={isSelected} />
      <Box flexGrow={1}>
        <Text color={isActive ? "green" : "white"}>{children}</Text>
      </Box>
      <Box>{meta && <Text>{meta}</Text>}</Box>
    </Box>
  );
}

export function SelectItemBullet({
  isSelected,
}: Pick<ComponentProps<typeof SelectItem>, "isSelected">) {
  return (
    <Box>
      <Text>（{isSelected ? <Text color="whiteBright">•</Text> : " "}）</Text>
    </Box>
  );
}
