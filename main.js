const items = [
  { id: 2, seqId: 4, parent: 5, name: "index.tsx" },
  { id: 3, seqId: 3, parent: 1, name: "Sidebar" },
  { id: 4, seqId: 5, parent: 1, name: "Table" },
  { id: 7, seqId: 5, parent: 5, name: "SelectableDropdown.tsx" },
  { id: 5, seqId: 2, parent: 1, name: "AssignmentTable" },
  { id: 1, seqId: 1, parent: null, name: "components" },
  { id: 6, seqId: 2, parent: null, name: "controllers" },
];

/**
 * Transfrom items with proper sorting see exampleFinalResult example array
 * @param array 
 * ```
 * const example = [
      { id: 2, seqId: 4, parent: 5, name: "index.tsx" },
      { id: 3, seqId: 3, parent: 1, name: "Sidebar" },
      { id: 4, seqId: 5, parent: 1, name: "Table" },
      { id: 7, seqId: 5, parent: 5, name: "SelectableDropdown.tsx" },
      { id: 5, seqId: 2, parent: 1, name: "AssignmentTable" },
      { id: 1, seqId: 1, parent: null, name: "components" },
      { id: 6, seqId: 2, parent: null, name: "controllers" },
    ];
 * 
 * ```
 * @returns sorted items
 * 
 * Output:
 * The seqId is used for ordering within siblings.
 * The depth would depend on the number of ancestors.
 * ```
  const exampleFinalResult = [
      { id: 1, seqId: 1, parent: null, depth: 0, name: 'components' },
      { id: 5, seqId: 2, parent: 1, depth: 1, name: 'AssignmentTable' },
      { id: 2, seqId: 4, parent: 5, depth: 2, name: 'index.tsx' },
      { id: 7, seqId: 5, parent: 5, depth: 2, name: 'SelectableDropdown.tsx' },
      { id: 3, seqId: 3, parent: 1, depth: 1, name: 'Sidebar' },
      { id: 4, seqId: 5, parent: 1, depth: 1, name: 'Table' },
      { id: 6, seqId: 2, parent: null, depth: 0, name: 'controllers' }
  ]
 * ```
 * 
 */
const transformItems = (items) => {
  // Add a depth into our array items
  const generateDepth = (item, depth = 0) => {
    if (item.parent) {
      const parent = items.find((itm) => itm.id === item.parent);
      if (parent) {
        return generateDepth(parent, depth + 1);
      } else {
        throw new Error(
          `Please check the associated parent from the item with and ID of ${item.id}`
        );
      }
    } else {
      return depth;
    }
  };

  /**
   *
   * @param {array} array
   * @param {item} item of the array
   * @returns
   */
  const generateChildren = (array = [], item) => {
    let newItems = [...array];
    if (item.parent) {
      const parent = newItems.find((itm) => itm.id === item.parent);

      if (parent) {
        newItems = newItems.map((newItem) => {
          if (newItem.id === parent.id) {
            return {
              ...newItem,
              children: newItem.children.push(item),
            };
          } else {
            return newItem;
          }
        });
        return generateChildren(newItems, parent);
      } else {
        throw new Error(
          `Please check the associated parent from the item with and ID of ${item.id}`
        );
      }
    } else {
      return newItems.find((newItem) => newItem.id === item.id).children;
    }
  };

  // Create items array with generatedDepth and initial children property
  let newArrayItems = items.map((newArrayItem) => ({
    ...newArrayItem,
    depth: generateDepth(newArrayItem),
    children: [],
  }));

  // Add children to this array and sort the children by its seqId props
  newArrayItems = newArrayItems.map((item, _, arr) => {
    let children = generateChildren(arr, item);

    if (Array.isArray(children)) {
      children = children
        // Remove duplicate items if there is
        .filter((child, i, childrenArray) => {
          return (
            i ===
            childrenArray.findIndex(
              (childOfTheArray) => childOfTheArray.id === child.id
            )
          );
        })
        .sort((a, b) => (a.seqId < b.seqId ? -1 : 1));
    }

    return {
      ...item,
      children,
    };
  });

  // Get only the main parent and sort them by their seqId
  const sortedNewArrayItems = newArrayItems
    .filter((item) => !item.parent)
    .sort((a, b) => (a.seqId < b.seqId ? -1 : 1));

  let sortedItems = [];

  /**
   *
   * @param {item} item item of the array items that pass in the transformItems function
   */
  const generateItemsBySortedChildren = (item) => {
    sortedItems.push(item);
    if (item.children.length) {
      item.children.forEach((child) => {
        sortedItems.push(child);
        return generateItemsBySortedChildren(child);
      });
    }
  };

  sortedNewArrayItems.forEach((item) => {
    generateItemsBySortedChildren(item);
  });

  // Remove dupicate items if there is
  const fiteredSortedItems = sortedItems.filter(
    (sortedItem, i, originalSortedItems) => {
      return (
        i ===
        originalSortedItems.findIndex(
          (originalSortedItem) => originalSortedItem.id === sortedItem.id
        )
      );
    }
  );

  // Remove the children props
  const finalItems = fiteredSortedItems.map(({ children, ...rest }) => {
    return {
      ...rest,
    };
  });

  return finalItems;
};

const finalResult = transformItems(items);

console.log(finalResult);
