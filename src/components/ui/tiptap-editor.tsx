"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useState, useEffect } from 'react';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { BoldIcon, ItalicIcon, Heading1Icon, Heading2Icon, SaveIcon, EyeIcon } from 'lucide-react';

interface TipTapEditorProps {
  content: string;
  onSave: (content: string) => void;
  onPreview: () => void;
  onCancelEdit: () => void;
}

export function TipTapEditor({ content, onSave, onPreview, onCancelEdit }: TipTapEditorProps) {
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Placeholder.configure({
        placeholder: 'Start typing your assignment response...',
      }),
    ],
    content: content,
    parseOptions: {
      preserveWhitespace: 'full',
    },
    // Remove auto-save on update - only save when user clicks save button
    // onUpdate: ({ editor }) => {
    //   // Auto-save functionality
    //   const currentContent = editor.getHTML();
    //   if (currentContent !== lastSavedContent) {
    //     // Debounce auto-save
    //     const timeoutId = setTimeout(() => {
    //       handleSave(currentContent);
    //       }, 1000);
    //       
    //       return () => clearTimeout(timeoutId);
    //     }
    //   },
    // Fix SSR issue by setting immediatelyRender to false
    immediatelyRender: false,
  });



  const toggleBold = () => {
    editor?.chain().focus().toggleBold().run();
  };

  const toggleItalic = () => {
    editor?.chain().focus().toggleItalic().run();
  };

  const toggleHeading1 = () => {
    editor?.chain().focus().toggleHeading({ level: 1 }).run();
  };

  const toggleHeading2 = () => {
    editor?.chain().focus().toggleHeading({ level: 2 }).run();
  };



  // Don't render until we're on the client side
  if (!isClient || !editor) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Loading editor...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">Edit Response</CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={() => onSave(editor.getHTML())}
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <SaveIcon className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button
              onClick={onPreview}
              variant="outline"
              size="sm"
              className="border-border text-foreground hover:bg-accent"
            >
              <EyeIcon className="w-4 h-4 mr-2" />
              Preview PDF
            </Button>
            <Button
              onClick={onCancelEdit}
              variant="outline"
              size="sm"
              className="border-border text-foreground hover:bg-accent"
            >
              Cancel
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Toolbar */}
        <div className="flex flex-wrap gap-2 mb-4 p-3 bg-muted/50 rounded-lg border border-border">
          <Button
            onClick={toggleBold}
            variant={editor.isActive('bold') ? 'default' : 'outline'}
            size="sm"
            className={editor.isActive('bold') ? 'bg-primary text-primary-foreground' : 'border-border text-foreground hover:bg-accent'}
          >
            <BoldIcon className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={toggleItalic}
            variant={editor.isActive('italic') ? 'default' : 'outline'}
            size="sm"
            className={editor.isActive('italic') ? 'bg-primary text-primary-foreground' : 'border-border text-foreground hover:bg-accent'}
          >
            <ItalicIcon className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={toggleHeading1}
            variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'outline'}
            size="sm"
            className={editor.isActive('heading', { level: 1 }) ? 'bg-primary text-primary-foreground' : 'border-border text-foreground hover:bg-accent'}
          >
            <Heading1Icon className="w-4 h-4" />
          </Button>
          
          <Button
            onClick={toggleHeading2}
            variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'outline'}
            size="sm"
            className={editor.isActive('heading', { level: 2 }) ? 'bg-primary text-primary-foreground' : 'border-border text-foreground hover:bg-accent'}
          >
            <Heading2Icon className="w-4 h-4" />
          </Button>
          
        </div>

        {/* Editor */}
        <div className="border border-border rounded-lg p-4 min-h-[400px] bg-background">
          <EditorContent 
            editor={editor} 
            className="prose prose-gray max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-em:text-foreground prose-code:text-foreground prose-pre:text-foreground prose-blockquote:text-foreground prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground"
          />
        </div>
      </CardContent>
    </Card>
  );
}
