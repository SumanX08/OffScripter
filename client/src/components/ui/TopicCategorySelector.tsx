import { useMemo, useState, useId } from "react";
import {
  Check,
  ChevronDown,
  ChevronRight,
  Filter,
  Minus,
  Search,
  X,
} from "lucide-react";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
} from "framer-motion";

import {
  TOPIC_TAXONOMY,
  type SelectedCategory,
} from "../../data/topic-taxonomy";

type Props = {
  selectedCategories: SelectedCategory[];
  onChange: (categories: SelectedCategory[]) => void;
  disabled?: boolean;
};

type SelectionState = "checked" | "unchecked" | "mixed";

// ─────────────────────────────────────────
// Animated Checkbox
// ─────────────────────────────────────────

function CategoryCheckbox({
  state,
  orange = false,
}: {
  state: SelectionState;
  orange?: boolean;
}) {
  const reduceMotion = useReducedMotion();
  const isSelected = state !== "unchecked";

  const selectedColor = orange ? "#B96B25" : "#59683B";

  return (
    <motion.span
      aria-hidden="true"
      initial={false}
      animate={{
        backgroundColor: isSelected
          ? selectedColor
          : "#FCF9EC",

        borderColor: isSelected
          ? selectedColor
          : "rgba(38, 57, 17, 0.35)",
      }}
      transition={{
        duration: reduceMotion ? 0 : 0.18,
      }}
      className="
        grid size-[18px] shrink-0
        place-items-center rounded-[3px]
        border text-white
      "
    >
      <AnimatePresence mode="wait" initial={false}>
        {state !== "unchecked" && (
          <motion.span
            key={state}
            initial={{
              opacity: 0,
              scale: reduceMotion ? 1 : 0.4,
            }}
            animate={{
              opacity: 1,
              scale: reduceMotion ? 1 : [0.8, 1.2, 1],
            }}
            exit={{
              opacity: 0,
              scale: reduceMotion ? 1 : 0.5,
            }}
            transition={{
              duration: reduceMotion ? 0 : 0.18,
              ease: "easeOut",
            }}
            className="flex items-center justify-center"
          >
            {state === "checked" ? (
              <Check size={13} strokeWidth={2.5} />
            ) : (
              <Minus size={13} strokeWidth={2.5} />
            )}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.span>
  );
}

// ─────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────

export default function TopicCategorySelector({
  selectedCategories,
  onChange,
  disabled = false,
}: Props) {
  const titleId = useId();
  const contentId = useId();

  const reduceMotion = useReducedMotion();

  const [query, setQuery] = useState("");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [expanded, setExpanded] = useState<Set<string>>(
    new Set()
  );

  const searching = Boolean(query.trim());

  const duration = (value: number) =>
    reduceMotion ? 0 : value;

  // ───────────────────────────────────────
  // Selection Count
  // ───────────────────────────────────────

  const selectedCount = selectedCategories.reduce(
    (count, category) =>
      count + (category.subcategories.length || 1),
    0
  );

  // ───────────────────────────────────────
  // Search
  // ───────────────────────────────────────

  const filteredCategories = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) return TOPIC_TAXONOMY;

    return TOPIC_TAXONOMY.filter(
      (category) =>
        category.name.toLowerCase().includes(search) ||
        category.subcategories.some((subcategory) =>
          subcategory.name.toLowerCase().includes(search)
        )
    );
  }, [query]);

  // ───────────────────────────────────────
  // Selection Helpers
  // ───────────────────────────────────────

  const getSelectedCategory = (categoryId: string) =>
    selectedCategories.find(
      (category) => category.id === categoryId
    );

  const getCategoryState = (
    categoryId: string
  ): SelectionState => {
    const selected = getSelectedCategory(categoryId);

    if (!selected) return "unchecked";

    if (selected.subcategories.length === 0) {
      return "checked";
    }

    const category = TOPIC_TAXONOMY.find(
      (item) => item.id === categoryId
    );

    if (
      category &&
      selected.subcategories.length ===
        category.subcategories.length
    ) {
      return "checked";
    }

    return "mixed";
  };

  // ───────────────────────────────────────
  // Expand / Collapse Category
  // ───────────────────────────────────────

  const toggleExpanded = (categoryId: string) => {
    setExpanded((current) => {
      const next = new Set(current);

      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }

      return next;
    });
  };

  // ───────────────────────────────────────
  // Toggle Entire Category
  // ───────────────────────────────────────

  const toggleCategory = (categoryId: string) => {
    if (disabled) return;

    const state = getCategoryState(categoryId);

    const remaining = selectedCategories.filter(
      (category) => category.id !== categoryId
    );

    if (state === "checked") {
      onChange(remaining);
      return;
    }

    onChange([
      ...remaining,
      {
        id: categoryId,
        subcategories: [],
      },
    ]);
  };

  // ───────────────────────────────────────
  // Toggle Individual Subcategory
  // ───────────────────────────────────────

  const toggleSubcategory = (
    categoryId: string,
    subcategoryId: string
  ) => {
    if (disabled) return;

    const category = TOPIC_TAXONOMY.find(
      (item) => item.id === categoryId
    );

    if (!category) return;

    const selected = getSelectedCategory(categoryId);

    const allIds = category.subcategories.map(
      (subcategory) => subcategory.id
    );

    const remaining = selectedCategories.filter(
      (item) => item.id !== categoryId
    );

    const currentIds = !selected
      ? []
      : selected.subcategories.length === 0
        ? allIds
        : selected.subcategories;

    const nextIds = currentIds.includes(subcategoryId)
      ? currentIds.filter((id) => id !== subcategoryId)
      : [...currentIds, subcategoryId];

    if (nextIds.length === 0) {
      onChange(remaining);
      return;
    }

    onChange([
      ...remaining,
      {
        id: categoryId,
        subcategories:
          nextIds.length === allIds.length ? [] : nextIds,
      },
    ]);
  };

  const isSubcategorySelected = (
    categoryId: string,
    subcategoryId: string
  ) => {
    const selected = getSelectedCategory(categoryId);

    if (!selected) return false;

    return (
      selected.subcategories.length === 0 ||
      selected.subcategories.includes(subcategoryId)
    );
  };

  return (
    <aside
      aria-label="Practice preferences"
      className="
        relative w-full min-w-0
        rounded-[3px]
        border border-[#263911]/35
        bg-[#F9F1D7]
        shadow-[7px_8px_0_rgba(204,213,174,0.7),0_20px_40px_rgba(40,54,24,0.13)]
        transition-shadow duration-300
      "
    >
      {/* Decorative Inner Border */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute inset-[9px]
          border border-[#B96B25]/20
        "
      />

      {/* ────────────────────────────────
          Mobile Toggle
      ───────────────────────────────── */}

      <motion.button
        type="button"
        aria-expanded={isMobileOpen}
        aria-controls={contentId}
        onClick={() => setIsMobileOpen((open) => !open)}
        whileTap={reduceMotion ? undefined : { scale: 0.99 }}
        className="
          relative z-10 flex w-full items-center
          justify-between gap-3 p-5 lg:hidden
        "
      >
        <span className="flex items-center gap-2 text-sm font-semibold">
          <Filter size={17} />
          Practice preferences
        </span>

        <span className="flex items-center gap-2 text-xs text-[#263911]/65">
          {selectedCount
            ? `${selectedCount} selected`
            : "All topics"}

          <motion.span
            initial={false}
            animate={{
              rotate: isMobileOpen ? 180 : 0,
            }}
            transition={{
              duration: duration(0.2),
            }}
          >
            <ChevronDown size={16} />
          </motion.span>
        </span>
      </motion.button>

      {/* ────────────────────────────────
          Main Panel
      ───────────────────────────────── */}

      <div
        id={contentId}
        inert={!isMobileOpen ? undefined : false}
        className={`
          relative grid
          transition-[grid-template-rows,opacity]
          duration-300 ease-in-out
          motion-reduce:transition-none
          lg:grid-rows-[1fr] lg:opacity-100
          ${
            isMobileOpen
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }
        `}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            className="
              flex flex-col p-5 sm:p-6
              lg:h-100
            "
          >
            {/* ──────────────────────────
                Header
            ─────────────────────────── */}

            <header className="flex shrink-0 items-center justify-between gap-3">
              <div className="min-w-0">
                <span
                  className="
                    text-[9px] font-semibold uppercase
                    tracking-[0.16em] text-[#B96B25]
                  "
                >
                  Tailor your practice
                </span>

                <h2
                  id={titleId}
                  className="
                    mt-1 font-serif text-[26px]
                    font-bold leading-tight
                    tracking-[-0.03em]
                    text-[#263911]
                  "
                >
                  Practice preferences
                </h2>
              </div>

              {/* Animated Selected Counter */}
              <div
                className="
                  flex shrink-0 flex-col items-center
                  border-l border-[#263911]/20 pl-4
                "
              >
                <div
                  aria-live="polite"
                  aria-atomic="true"
                  className="
                    relative h-7 min-w-8 overflow-hidden
                  "
                >
                  <AnimatePresence
                    initial={false}
                    mode="popLayout"
                  >
                    <motion.strong
                      key={selectedCount}
                      initial={{
                        opacity: 0,
                        y: reduceMotion ? 0 : 12,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      exit={{
                        opacity: 0,
                        y: reduceMotion ? 0 : -12,
                      }}
                      transition={{
                        duration: duration(0.2),
                        ease: "easeOut",
                      }}
                      className="
                        block text-center font-serif
                        text-2xl leading-none
                        text-[#B96B25]
                      "
                    >
                      {selectedCount}
                    </motion.strong>
                  </AnimatePresence>
                </div>

                <span
                  className="
                    mt-1 text-[8px] font-semibold uppercase
                    tracking-wider
                  "
                >
                  Selected
                </span>
              </div>
            </header>

            {/* Description */}
            <p
              className="
                mt-2 shrink-0 text-[11px]
                leading-5 text-[#263911]/65
              "
            >
              Choose focus areas, or leave clear for a surprise.
            </p>

            {/* ──────────────────────────
                Search Bar
            ─────────────────────────── */}

            <label
              className="
                group mt-3 flex h-9 shrink-0
                items-center gap-2 border-y
                border-[#263911]/20
                bg-[#FCF9EC]/70 px-3
                transition-all duration-200
                focus-within:border-[#B96B25]
                focus-within:bg-[#FCF9EC]
                focus-within:shadow-[0_0_0_2px_#B96B2510]
                motion-reduce:transition-none
              "
            >
              <Search
                size={15}
                className="
                  shrink-0 text-[#263911]/60
                  transition-colors duration-200
                  group-focus-within:text-[#B96B25]
                "
              />

              <span className="sr-only">
                Search categories
              </span>

              <input
                type="search"
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                placeholder="Search categories..."
                className="
                  w-full min-w-0 bg-transparent
                  text-xs outline-none
                  placeholder:text-[#263911]/40
                  [&::-webkit-search-cancel-button]:hidden
                "
              />

              <AnimatePresence initial={false}>
                {query && (
                  <motion.button
                    type="button"
                    initial={{
                      opacity: 0,
                      scale: reduceMotion ? 1 : 0.5,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      scale: reduceMotion ? 1 : 0.5,
                    }}
                    whileTap={
                      reduceMotion
                        ? undefined
                        : { scale: 0.85 }
                    }
                    transition={{
                      duration: duration(0.15),
                    }}
                    onClick={() => setQuery("")}
                    aria-label="Clear search"
                    className="
                      text-[#263911]/50
                      hover:text-[#B96B25]
                    "
                  >
                    <X size={14} />
                  </motion.button>
                )}
              </AnimatePresence>
            </label>

            {/* ──────────────────────────
                Scrollable Category Tree
            ─────────────────────────── */}

            <div
              aria-label="Topic categories"
              className="
                mt-2 min-h-0 max-h-[260px]
                flex-1 overflow-y-auto
                overscroll-contain pr-2
                lg:max-h-none
                [scrollbar-width:thin]
                [scrollbar-color:#C99A68_transparent]
              "
            >
              <AnimatePresence initial={false}>
                {filteredCategories.map((category) => {
                  const hasChildren =
                    category.subcategories.length > 0;

                  const isExpanded =
                    searching || expanded.has(category.id);

                  const state = getCategoryState(
                    category.id
                  );

                  const visibleSubcategories =
                    searching &&
                    !category.name
                      .toLowerCase()
                      .includes(query.trim().toLowerCase())
                      ? category.subcategories.filter(
                          (subcategory) =>
                            subcategory.name
                              .toLowerCase()
                              .includes(
                                query.trim().toLowerCase()
                              )
                        )
                      : category.subcategories;

                  return (
                    <motion.div
                      key={category.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: duration(0.15),
                      }}
                      className="
                        border-b border-[#263911]/10
                      "
                    >
                      {/* ─────────────────
                          Parent Category
                      ────────────────── */}

                      <motion.div
                        initial={false}
                        animate={{
                          backgroundColor:
                            state !== "unchecked"
                              ? "rgba(89, 104, 59, 0.08)"
                              : "rgba(89, 104, 59, 0)",
                        }}
                        whileHover={
                          disabled
                            ? undefined
                            : {
                                backgroundColor:
                                  "rgba(89, 104, 59, 0.12)",
                              }
                        }
                        transition={{
                          duration: duration(0.18),
                        }}
                        className="
                          flex min-h-9 items-center
                          gap-2 rounded-[3px] px-1
                        "
                      >
                        {/* Expand Button */}
                        {hasChildren ? (
                          <motion.button
                            type="button"
                            disabled={searching}
                            aria-expanded={isExpanded}
                            aria-label={`${
                              isExpanded
                                ? "Collapse"
                                : "Expand"
                            } ${category.name}`}
                            onClick={() =>
                              toggleExpanded(category.id)
                            }
                            whileTap={
                              searching || reduceMotion
                                ? undefined
                                : { scale: 0.85 }
                            }
                            className="
                              grid size-7 shrink-0
                              place-items-center
                              text-[#263911]/70
                              transition-colors
                              hover:text-[#B96B25]
                              disabled:cursor-default
                            "
                          >
                            <motion.span
                              initial={false}
                              animate={{
                                rotate: isExpanded ? 90 : 0,
                              }}
                              transition={{
                                duration: duration(0.2),
                                ease: [0.4, 0, 0.2, 1],
                              }}
                              className="
                                flex items-center
                                justify-center
                              "
                            >
                              <ChevronRight size={15} />
                            </motion.span>
                          </motion.button>
                        ) : (
                          <span className="w-7 shrink-0" />
                        )}

                        {/* Parent Selection */}
                        <motion.button
                          type="button"
                          role="checkbox"
                          aria-checked={
                            state === "mixed"
                              ? "mixed"
                              : state === "checked"
                          }
                          disabled={disabled}
                          onClick={() =>
                            toggleCategory(category.id)
                          }
                          whileTap={
                            disabled || reduceMotion
                              ? undefined
                              : { scale: 0.98 }
                          }
                          transition={{
                            duration: duration(0.12),
                          }}
                          className="
                            flex min-h-9 min-w-0 flex-1
                            items-center gap-2.5 py-1
                            text-left text-xs
                            transition-colors duration-200
                            hover:text-[#B96B25]
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                          "
                        >
                          <CategoryCheckbox state={state} />

                          <span
                            className={`transition-colors duration-200 ${
                              state !== "unchecked"
                                ? "font-semibold text-[#263911]"
                                : "font-medium"
                            }`}
                          >
                            {category.name}
                          </span>
                        </motion.button>

                        {/* Partial Selection Count */}
                        <AnimatePresence initial={false}>
                          {state === "mixed" && (
                            <motion.span
                              initial={{
                                opacity: 0,
                                x: reduceMotion ? 0 : 5,
                              }}
                              animate={{
                                opacity: 1,
                                x: 0,
                              }}
                              exit={{
                                opacity: 0,
                                x: reduceMotion ? 0 : 5,
                              }}
                              transition={{
                                duration: duration(0.15),
                              }}
                              className="
                                shrink-0 pr-1 text-[10px]
                                font-medium text-[#B96B25]
                              "
                            >
                              {
                                getSelectedCategory(
                                  category.id
                                )?.subcategories.length
                              }
                              /{category.subcategories.length}
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.div>

                      {/* ─────────────────
                          Animated Children
                      ────────────────── */}

                      <AnimatePresence initial={false}>
                        {hasChildren && isExpanded && (
                          <motion.div
                            key={`${category.id}-children`}
                            initial={{
                              height: 0,
                              opacity: 0,
                            }}
                            animate={{
                              height: "auto",
                              opacity: 1,
                            }}
                            exit={{
                              height: 0,
                              opacity: 0,
                            }}
                            transition={{
                              height: {
                                duration: duration(0.22),
                                ease: [0.4, 0, 0.2, 1],
                              },
                              opacity: {
                                duration: duration(0.15),
                              },
                            }}
                            className="overflow-hidden"
                          >
                            <div
                              className="
                                mb-2 ml-[35px] space-y-0.5
                                border-l border-[#263911]/15
                                pl-3 pt-1
                              "
                            >
                              {visibleSubcategories.map(
                                (subcategory, index) => {
                                  const checked =
                                    isSubcategorySelected(
                                      category.id,
                                      subcategory.id
                                    );

                                  return (
                                    <motion.button
                                      key={subcategory.id}
                                      type="button"
                                      role="checkbox"
                                      aria-checked={checked}
                                      disabled={disabled}
                                      initial={{
                                        opacity: 0,
                                        x: reduceMotion
                                          ? 0
                                          : -6,
                                      }}
                                      animate={{
                                        opacity: 1,
                                        x: 0,
                                        backgroundColor:
                                          checked
                                            ? "rgba(185, 107, 37, 0.09)"
                                            : "rgba(185, 107, 37, 0)",
                                      }}
                                      whileHover={
                                        disabled
                                          ? undefined
                                          : {
                                              backgroundColor:
                                                "rgba(185, 107, 37, 0.13)",
                                            }
                                      }
                                      whileTap={
                                        disabled || reduceMotion
                                          ? undefined
                                          : { scale: 0.98 }
                                      }
                                      transition={{
                                        opacity: {
                                          duration:
                                            duration(0.15),
                                          delay: duration(
                                            Math.min(
                                              index * 0.025,
                                              0.1
                                            )
                                          ),
                                        },
                                        x: {
                                          duration:
                                            duration(0.18),
                                          delay: duration(
                                            Math.min(
                                              index * 0.025,
                                              0.1
                                            )
                                          ),
                                        },
                                        backgroundColor: {
                                          duration:
                                            duration(0.15),
                                        },
                                      }}
                                      onClick={() =>
                                        toggleSubcategory(
                                          category.id,
                                          subcategory.id
                                        )
                                      }
                                      className="
                                        flex min-h-8 w-full
                                        items-center gap-2.5
                                        rounded-[3px] px-2 py-1
                                        text-left text-xs
                                        text-[#263911]/80
                                        transition-colors
                                        hover:text-[#B96B25]
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                      "
                                    >
                                      <CategoryCheckbox
                                        state={
                                          checked
                                            ? "checked"
                                            : "unchecked"
                                        }
                                        orange
                                      />

                                      <span
                                        className={`
                                          transition-colors
                                          duration-200
                                          ${
                                            checked
                                              ? "font-semibold text-[#B96B25]"
                                              : ""
                                          }
                                        `}
                                      >
                                        {subcategory.name}
                                      </span>
                                    </motion.button>
                                  );
                                }
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {/* ──────────────────────
                  Empty Search State
              ─────────────────────── */}

              <AnimatePresence>
                {!filteredCategories.length && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: reduceMotion ? 0 : 5,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: duration(0.2),
                    }}
                    className="py-8 text-center"
                  >
                    <motion.div
                      initial={{
                        scale: reduceMotion ? 1 : 0.8,
                      }}
                      animate={{ scale: 1 }}
                      transition={{
                        duration: duration(0.2),
                      }}
                    >
                      <Search
                        size={22}
                        className="
                          mx-auto mb-2
                          text-[#263911]/30
                        "
                      />
                    </motion.div>

                    <p className="text-xs text-[#263911]/60">
                      No categories found.
                    </p>

                    <button
                      type="button"
                      onClick={() => setQuery("")}
                      className="
                        mt-2 text-xs text-[#B96B25]
                        underline underline-offset-4
                      "
                    >
                      Clear search
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ──────────────────────────
                Fixed Footer
            ─────────────────────────── */}

            <footer
              className="
                mt-2 flex shrink-0 items-center
                justify-between gap-2
                border-t border-[#263911]/20 pt-3
              "
            >
              <div className="flex items-center gap-2">
                {/* Status Indicator */}
                <motion.span
                  initial={false}
                  animate={{
                    backgroundColor: selectedCount
                      ? "#B96B25"
                      : "#59683B",
                    scale:
                      selectedCount && !reduceMotion
                        ? [1, 1.3, 1]
                        : 1,
                  }}
                  transition={{
                    duration: duration(0.2),
                  }}
                  className="size-[5px] shrink-0 rounded-full"
                />

                <AnimatePresence
                  initial={false}
                  mode="wait"
                >
                  <motion.span
                    key={selectedCount}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: duration(0.1),
                    }}
                    className="
                      text-[9px] font-semibold uppercase
                      tracking-wider text-[#263911]/70
                    "
                  >
                    {selectedCount
                      ? `${selectedCount} filters selected`
                      : "All topics included"}
                  </motion.span>
                </AnimatePresence>
              </div>

              {/* Clear Selection */}
              <motion.button
                type="button"
                disabled={disabled || !selectedCount}
                onClick={() => onChange([])}
                whileHover={
                  selectedCount &&
                  !disabled &&
                  !reduceMotion
                    ? { x: -2 }
                    : undefined
                }
                whileTap={
                  selectedCount &&
                  !disabled &&
                  !reduceMotion
                    ? { scale: 0.92 }
                    : undefined
                }
                transition={{
                  duration: duration(0.15),
                }}
                className="
                  shrink-0 text-[10px] font-semibold
                  uppercase tracking-wider
                  text-[#B96B25]
                  transition-colors
                  hover:text-[#263911]
                  disabled:cursor-not-allowed
                  disabled:opacity-30
                "
              >
                Clear all
              </motion.button>
            </footer>
          </div>
        </div>
      </div>
    </aside>
  );
}