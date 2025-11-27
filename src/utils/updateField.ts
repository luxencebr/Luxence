function updateField(path: string, value: any) {
  setEditableProducer((prev) => {
    const copy = structuredClone(prev);
    const segments = path.split(".");
    let current = copy;

    for (let i = 0; i < segments.length - 1; i++) {
      current = current[segments[i]];
    }

    current[segments.at(-1)!] = value;
    return copy;
  });
}
