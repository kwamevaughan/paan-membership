"use client";

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, FORMAT_TEXT_COMMAND, $createParagraphNode, $createHeadingNode } from 'lexical';
import { Icon } from "@iconify/react";

const Toolbar = () => {
  const [editor] = useLexicalComposerContext();

  const formatText = (format) => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, format);
  };

  const insertHeading = (level) => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const node = selection.getNodes()[0];
        if (node) {
          const headingNode = $createHeadingNode(`h${level}`);
          node.replace(headingNode);
          headingNode.select();
        }
      }
    });
  };

  const insertList = (type) => {
    editor.dispatchCommand('INSERT_LIST', type);
  };

  const insertLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.dispatchCommand('INSERT_LINK', url);
    }
  };

  return (
    <div className="flex flex-wrap gap-2 p-2 border-b border-gray-200 dark:border-gray-700">
      <button
        onClick={() => formatText('bold')}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
        title="Bold"
      >
        <Icon icon="mdi:format-bold" width={20} height={20} />
      </button>
      <button
        onClick={() => formatText('italic')}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
        title="Italic"
      >
        <Icon icon="mdi:format-italic" width={20} height={20} />
      </button>
      <button
        onClick={() => formatText('underline')}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
        title="Underline"
      >
        <Icon icon="mdi:format-underline" width={20} height={20} />
      </button>
      <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
      <button
        onClick={() => insertHeading(1)}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
        title="Heading 1"
      >
        <Icon icon="mdi:format-header-1" width={20} height={20} />
      </button>
      <button
        onClick={() => insertHeading(2)}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
        title="Heading 2"
      >
        <Icon icon="mdi:format-header-2" width={20} height={20} />
      </button>
      <button
        onClick={() => insertHeading(3)}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
        title="Heading 3"
      >
        <Icon icon="mdi:format-header-3" width={20} height={20} />
      </button>
      <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
      <button
        onClick={() => insertList('bullet')}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
        title="Bullet List"
      >
        <Icon icon="mdi:format-list-bulleted" width={20} height={20} />
      </button>
      <button
        onClick={() => insertList('number')}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
        title="Numbered List"
      >
        <Icon icon="mdi:format-list-numbered" width={20} height={20} />
      </button>
      <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
      <button
        onClick={insertLink}
        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
        title="Insert Link"
      >
        <Icon icon="mdi:link" width={20} height={20} />
      </button>
    </div>
  );
};

export default Toolbar; 