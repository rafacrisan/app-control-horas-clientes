import React, { useState } from 'react';
import { Comment } from '../types.ts';

interface CommentManagerProps {
  onAddComment: (text: string) => void;
  onEditComment: (id: number, text: string) => void;
  comments: Comment[];
}

const CommentManager: React.FC<CommentManagerProps> = ({ onAddComment, onEditComment, comments }) => {
  const [commentText, setCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [editedText, setEditedText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(commentText);
    setCommentText('');
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    });
  };

  const handleEditStart = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditedText(comment.text);
  };

  const handleEditCancel = () => {
    setEditingCommentId(null);
    setEditedText('');
  };

  const handleEditSave = () => {
    if (editingCommentId === null || !editedText.trim()) {
      handleEditCancel(); // Cancel if text is empty
      return;
    }
    onEditComment(editingCommentId, editedText.trim());
    setEditingCommentId(null);
    setEditedText('');
  };

  return (
    <div className="border-t border-gray-700 pt-4 mt-4">
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="What are you working on?"
          className="w-full bg-gray-900 border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition placeholder-gray-500"
        />
        {/* Submission is handled by pressing Enter */}
      </form>
      
      {comments.length > 0 && (
        <div className="mt-4 space-y-2">
           <h4 className="text-xs text-gray-400 uppercase tracking-wider">Notes</h4>
          <ul className="text-sm text-gray-300 space-y-2 max-h-40 overflow-y-auto pr-2">
            {comments.map(comment => (
              <li key={comment.id} className="bg-gray-900/50 p-2 rounded-md flex justify-between items-center gap-2 min-h-[40px]">
                {editingCommentId === comment.id ? (
                    // Editing view
                    <input
                        type="text"
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                handleEditSave();
                            }
                            if (e.key === 'Escape') handleEditCancel();
                        }}
                        onBlur={handleEditSave} // Save when focus is lost
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition flex-grow"
                        autoFocus
                    />
                ) : (
                    // Default view
                    <>
                        <p 
                          className="break-words flex-grow cursor-pointer w-full"
                          onClick={() => handleEditStart(comment)}
                        >
                          {comment.text}
                        </p>
                        <div className="flex-shrink-0 flex items-center">
                            <span className="text-xs text-gray-500 whitespace-nowrap">{formatTimestamp(comment.timestamp)}</span>
                        </div>
                    </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CommentManager;
