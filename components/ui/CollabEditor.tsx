"use client";
import "@blocknote/mantine/style.css";
import { useEffect, useState } from "react";
import { useRoom } from "@liveblocks/react";
import { LiveblocksYjsProvider } from "@liveblocks/yjs";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import * as Y from "yjs";

interface Props {
  userName: string;
  userColor: string;
}

// Inner component — only rendered once doc + provider are ready
function BlockNoteCollab({
  doc,
  provider,
  userName,
  userColor,
}: {
  doc: Y.Doc;
  provider: LiveblocksYjsProvider;
  userName: string;
  userColor: string;
}) {
  const editor = useCreateBlockNote({
    collaboration: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      provider: provider as any,
      fragment: doc.getXmlFragment("document-store"),
      user: { name: userName, color: userColor },
    },
  });

  return (
    <BlockNoteView
      editor={editor}
      theme="light"
      style={{ fontFamily: "inherit", fontSize: 14 }}
    />
  );
}

export default function CollabEditor({ userName, userColor }: Props) {
  const room = useRoom();
  const [doc, setDoc] = useState<Y.Doc | null>(null);
  const [provider, setProvider] = useState<LiveblocksYjsProvider | null>(null);

  useEffect(() => {
    const yDoc = new Y.Doc();
    const yProvider = new LiveblocksYjsProvider(room, yDoc);
    setDoc(yDoc);
    setProvider(yProvider);

    return () => {
      yDoc.destroy();
      yProvider.destroy();
    };
  }, [room]);

  if (!doc || !provider) {
    return (
      <div style={{ padding: "24px 0", color: "#696969", fontSize: 14 }}>
        Connecting to live session…
      </div>
    );
  }

  return (
    <BlockNoteCollab
      doc={doc}
      provider={provider}
      userName={userName}
      userColor={userColor}
    />
  );
}
