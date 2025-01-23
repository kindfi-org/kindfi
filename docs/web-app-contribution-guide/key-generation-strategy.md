# Key Generation Strategy

## Purpose

To ensure all React list items use stable and unique keys to avoid rendering performance issues and better React reconciliation.

## Guidelines

1. **Use Data-Provided Unique Identifiers:**

- Whenever possible, use a unique identifier (like `id`, `slug`) from the data itself.
- Example: `<div key={item.id}>`

2. **Combine Fields When Necessary:**

- If no single field is unique, combine multiple fields.
- Example: `<div key={`${item.type}-${item.name}`}>`

3. **Pre-Add Keys:**

- If data lacks unique identifiers, consider adding an unique value to the data before rendering.

4. **Avoid Using Index as Key**:

- Using the index of the array as a key can lead to issues when the list is reordered or items are added/removed. Always prefer a unique identifier.

### Should You Use UUID for Keys?

Using UUIDs for keys is not recommended in most cases because:

#### Performance Issues:

Keys generated with UUID are unique but not stable. Each render will generate new UUIDs, which leads to React treating all elements as new, causing unnecessary re-renders and DOM updates.

## Example:

- Before:

```jsx
items.map((item, index) => <div key={index}>{item.name}</div>);
```

- After:

```jsx
items.map((item) => <div key={item.id}>{item.name}</div>);
```

---

### Final Recommendations

- **Preferred Approach:** Use existing data attributes (`id`, `slug`) wherever possible.
- **Avoid Overhead:** Minimize unnecessary key generation using libraries like `uuid`.
