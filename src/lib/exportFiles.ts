function withRelativePath(file: File, path: string): File {
  if ((file as File & { webkitRelativePath?: string }).webkitRelativePath) return file;
  try {
    Object.defineProperty(file, "webkitRelativePath", { value: path, configurable: true });
  } catch {
    /* ignore */
  }
  return file;
}

async function readDirectoryEntry(
  entry: FileSystemDirectoryEntry,
  prefix: string,
  files: File[]
): Promise<void> {
  const reader = entry.createReader();
  let batch: FileSystemEntry[];

  do {
    batch = await new Promise<FileSystemEntry[]>((resolve, reject) => {
      reader.readEntries(resolve, reject);
    });

    for (const child of batch) {
      if (child.isFile) {
        const file = await new Promise<File>((resolve, reject) => {
          (child as FileSystemFileEntry).file(resolve, reject);
        });
        files.push(withRelativePath(file, `${prefix}${child.name}`));
      } else if (child.isDirectory) {
        await readDirectoryEntry(child as FileSystemDirectoryEntry, `${prefix}${child.name}/`, files);
      }
    }
  } while (batch.length > 0);
}

function fileBasename(file: File): string {
  const rel = (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name;
  return rel.replace(/\\/g, "/").split("/").pop() || file.name;
}

export function findMessagesHtml(files: File[]): File | undefined {
  const isMessagesHtml = (file: File) => {
    const base = fileBasename(file).toLowerCase();
    return base === "messages.html" || (base.endsWith(".html") && base.includes("message"));
  };

  return (
    files.find((f) => fileBasename(f).toLowerCase() === "messages.html") ||
    files.find(isMessagesHtml)
  );
}

async function collectFromFileSystemEntry(
  entry: FileSystemEntry,
  files: File[]
): Promise<void> {
  if (entry.isFile) {
    const file = await new Promise<File>((resolve, reject) => {
      (entry as FileSystemFileEntry).file(resolve, reject);
    });
    files.push(withRelativePath(file, `${entry.name}`));
    return;
  }

  if (entry.isDirectory) {
    await readDirectoryEntry(entry as FileSystemDirectoryEntry, `${entry.name}/`, files);
  }
}

export async function collectDroppedFiles(dataTransfer: DataTransfer): Promise<File[]> {
  const items = Array.from(dataTransfer.items).filter((item) => item.kind === "file");
  const files: File[] = [];

  // Snapshot entries synchronously — dataTransfer is cleared after the drop handler returns.
  const entries = items.map((item) => ({
    entry: item.webkitGetAsEntry?.() ?? null,
    file: item.getAsFile(),
    hasFsHandle: typeof (item as DataTransferItem & { getAsFileSystemHandle?: unknown })
      .getAsFileSystemHandle === "function",
    item,
  }));

  for (const { entry, file, hasFsHandle, item } of entries) {
    if (hasFsHandle) {
      try {
        const handle = await (
          item as DataTransferItem & {
            getAsFileSystemHandle: () => Promise<FileSystemHandle>;
          }
        ).getAsFileSystemHandle();
        if (handle.kind === "file") {
          files.push(await (handle as FileSystemFileHandle).getFile());
        } else {
          files.push(
            ...(await collectFilesFromDirectoryHandle(handle as FileSystemDirectoryHandle))
          );
        }
        continue;
      } catch {
        /* fallback to webkitGetAsEntry */
      }
    }

    if (entry) {
      await collectFromFileSystemEntry(entry, files);
      continue;
    }

    if (file) files.push(file);
  }

  if (files.length > 0) return files;

  return Array.from(dataTransfer.files);
}

export async function collectFilesFromDirectoryHandle(
  dirHandle: FileSystemDirectoryHandle,
  prefix = ""
): Promise<File[]> {
  const files: File[] = [];

  for await (const [name, handle] of dirHandle as unknown as AsyncIterable<
    [string, FileSystemHandle]
  >) {
    const path = prefix ? `${prefix}/${name}` : name;
    if (handle.kind === "file") {
      files.push(
        withRelativePath(await (handle as FileSystemFileHandle).getFile(), path)
      );
      continue;
    }
    files.push(
      ...(await collectFilesFromDirectoryHandle(
        handle as FileSystemDirectoryHandle,
        path
      ))
    );
  }

  return files;
}

export async function pickExportFolderFiles(): Promise<File[]> {
  if (typeof window === "undefined" || !("showDirectoryPicker" in window)) {
    return [];
  }

  const dir = await (window as Window & { showDirectoryPicker: () => Promise<FileSystemDirectoryHandle> }).showDirectoryPicker();
  return collectFilesFromDirectoryHandle(dir);
}
