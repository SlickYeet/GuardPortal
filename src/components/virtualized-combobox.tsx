import { useVirtualizer } from "@tanstack/react-virtual"
import { Check, ChevronDown } from "lucide-react"
import * as React from "react"

import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type Option = {
  value: string
  label: string
}

interface VirtualizedCommandProps extends React.ComponentProps<"select"> {
  options: Option[]
  placeholder: string
  selectedOption: string
  onSelectOption?: (option: string) => void
}

const VirtualizedCommand = ({
  options,
  placeholder,
  selectedOption,
  onSelectOption,
}: VirtualizedCommandProps) => {
  const [filteredOptions, setFilteredOptions] =
    React.useState<Option[]>(options)
  const [focusedIndex, setFocusedIndex] = React.useState(0)
  const [isKeyboardNavActive, setIsKeyboardNavActive] = React.useState(false)

  const parentRef = React.useRef(null)

  const virtualizer = useVirtualizer({
    count: filteredOptions.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 35,
  })

  const virtualOptions = virtualizer.getVirtualItems()

  const scrollToIndex = (index: number) => {
    virtualizer.scrollToIndex(index, {
      align: "center",
    })
  }

  const handleSearch = (search: string) => {
    setIsKeyboardNavActive(false)
    setFilteredOptions(
      options.filter((option) =>
        option.value.toLowerCase().includes(search.toLowerCase() ?? []),
      ),
    )
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault()
        setIsKeyboardNavActive(true)
        setFocusedIndex((prev) => {
          const newIndex =
            prev === -1 ? 0 : Math.min(prev + 1, filteredOptions.length - 1)
          scrollToIndex(newIndex)
          return newIndex
        })
        break
      }
      case "ArrowUp": {
        event.preventDefault()
        setIsKeyboardNavActive(true)
        setFocusedIndex((prev) => {
          const newIndex =
            prev === -1 ? filteredOptions.length - 1 : Math.max(prev - 1, 0)
          scrollToIndex(newIndex)
          return newIndex
        })
        break
      }
      case "Enter": {
        event.preventDefault()
        if (filteredOptions[focusedIndex]) {
          onSelectOption?.(filteredOptions[focusedIndex].value)
        }
        break
      }
      default:
        break
    }
  }

  React.useEffect(() => {
    if (selectedOption) {
      const option = filteredOptions.find(
        (option) => option.value === selectedOption,
      )
      if (option) {
        const index = filteredOptions.indexOf(option)
        setFocusedIndex(index)
        virtualizer.scrollToIndex(index, {
          align: "center",
        })
      }
    }
  }, [selectedOption, filteredOptions, virtualizer])

  return (
    <Command shouldFilter={false} onKeyDown={handleKeyDown}>
      <CommandInput onValueChange={handleSearch} placeholder={placeholder} />
      {/* TODO: Fix not being able to scroll when inside dialog */}
      <CommandList
        ref={parentRef}
        style={{
          width: "100%",
          overflow: "auto",
        }}
        onMouseDown={() => setIsKeyboardNavActive(false)}
        onMouseMove={() => setIsKeyboardNavActive(false)}
      >
        <CommandEmpty>No item found.</CommandEmpty>
        <CommandGroup>
          <div
            style={{
              height: `${virtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {virtualOptions.map((virtualOption) => (
              <CommandItem
                key={filteredOptions[virtualOption.index].value}
                disabled={isKeyboardNavActive}
                className={cn(
                  "absolute top-0 left-0 w-full bg-transparent",
                  focusedIndex === virtualOption.index &&
                    "bg-accent text-accent-foreground",
                  isKeyboardNavActive &&
                    focusedIndex !== virtualOption.index &&
                    "aria-selected:text-primary aria-selected:bg-transparent",
                )}
                style={{
                  height: `${virtualOption.size}px`,
                  transform: `translateY(${virtualOption.start}px)`,
                }}
                value={filteredOptions[virtualOption.index].value}
                onMouseEnter={() =>
                  !isKeyboardNavActive && setFocusedIndex(virtualOption.index)
                }
                onMouseLeave={() => !isKeyboardNavActive && setFocusedIndex(-1)}
                onSelect={onSelectOption}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedOption ===
                      filteredOptions[virtualOption.index].value
                      ? "opacity-100"
                      : "opacity-0",
                  )}
                />
                {filteredOptions[virtualOption.index].label}
              </CommandItem>
            ))}
          </div>
        </CommandGroup>
      </CommandList>
    </Command>
  )
}

interface VirtualizedComboboxProps extends React.ComponentProps<"select"> {
  options: string[]
  onSelectOption?: (option: string) => void
  selectPlaceholder?: string
  searchPlaceholder?: string
  width?: string
}

export function VirtualizedCombobox({
  options,
  defaultValue,
  onSelectOption: onSelectOptionFromProps,
  selectPlaceholder = "Select an item",
  searchPlaceholder = "Search items...",
  width = "400px",
  className,
}: VirtualizedComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedOption, setSelectedOption] = React.useState(
    (defaultValue as string) ?? "",
  )

  React.useEffect(() => {
    setSelectedOption((defaultValue as string) ?? "")
  }, [defaultValue])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={className} asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="cursor-default justify-between"
        >
          {selectedOption ? (
            <span>{selectedOption}</span>
          ) : (
            <span className="text-muted-foreground">{selectPlaceholder}</span>
          )}
          <ChevronDown className="ml-2 size-4 shrink-0 opacity-30" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" style={{ width: width }}>
        <VirtualizedCommand
          options={options.map((option) => ({ value: option, label: option }))}
          placeholder={searchPlaceholder}
          selectedOption={selectedOption}
          onSelectOption={(currentValue) => {
            if (currentValue === selectedOption) {
              onSelectOptionFromProps?.("")
              setSelectedOption("")
              setOpen(false)
              return
            }
            onSelectOptionFromProps?.(currentValue)
            setSelectedOption(currentValue)
            setOpen(false)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
