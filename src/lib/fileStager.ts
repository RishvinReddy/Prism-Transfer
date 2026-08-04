"use client";

let stagedFile: File | null = null;

export function stageFile(file: File) {
  stagedFile = file;
}

export function getStagedFile(): File | null {
  const file = stagedFile;
  stagedFile = null; // Consume it
  return file;
}
