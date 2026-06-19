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

export async function collectDroppedFiles(dataTransfer: DataTransfer): Promise<File[]> {
  const items = Array.from(dataTransfer.items).filter((item) => item.kind === "file");
  const files: File[] = [];

  for (const item of items) {
    const entry = item.webkitGetAsEntry?.();
    if (!entry) continue;

    if (entry.isFile) {
      const file = await new Promise<File>((resolve, reject) => {
        (entry as FileSystemFileEntry).file(resolve, reject);
      });
      files.push(file);
    } else if (entry.isDirectory) {
      await readDirectoryEntry(entry as FileSystemDirectoryEntry, `${entry.name}/`, files);
    }
  }

  return files.length > 0 ? files : Array.from(dataTransfer.files);
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

export function findMessagesHtml(files: File[]): File | undefined {
  return (
    files.find((f) => f.name === "messages.html") ||
    files.find((f) => /\.html$/i.test(f.name) && f.name.toLowerCase().includes("message"))
  );
}

export async function pickExportFolderFiles(): Promise<File[]> {
  if (typeof window === "undefined" || !("showDirectoryPicker" in window)) {
    return [];
  }

  const dir = await (window as Window & { showDirectoryPicker: () => Promise<FileSystemDirectoryHandle> }).showDirectoryPicker();
  return collectFilesFromDirectoryHandle(dir);
}
