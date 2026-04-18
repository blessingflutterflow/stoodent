"use client";
import "@blocknote/mantine/style.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";

export default function Editor() {
  const editor = useCreateBlockNote({
    initialContent: [
      {
        type: "heading",
        props: { level: 2 },
        content: "Assignment Details",
      },
      {
        type: "paragraph",
        content: "",
      },
      {
        type: "paragraph",
        content: "Describe your assignment here, or paste the question. Your tutor will join this document shortly and type alongside you.",
      },
      {
        type: "paragraph",
        content: "",
      },
    ],
  });

  return (
    <BlockNoteView
      editor={editor}
      theme="light"
      style={{
        fontFamily: "inherit",
        fontSize: 14,
      }}
    />
  );
}
