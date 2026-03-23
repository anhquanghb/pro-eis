import React, { useState, useRef, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

interface FullFormatTextProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

const MODULES = {
    toolbar: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['link'],
        ['clean']
    ],
};

const FullFormatText: React.FC<FullFormatTextProps> = ({ value, onChange, placeholder, className }) => {
    const [isFocused, setIsFocused] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div 
            ref={wrapperRef}
            onMouseDownCapture={() => setIsFocused(true)}
            className={`quill-wrapper transition-all duration-200 ${isFocused ? 'is-focused bg-white rounded-lg border border-slate-200 shadow-sm' : 'bg-transparent border border-transparent hover:bg-slate-50 rounded-lg'} overflow-hidden ${className || ''}`}
        >
            <style>{`
                .quill-wrapper .ql-toolbar {
                    display: none !important;
                }
                .quill-wrapper.is-focused .ql-toolbar {
                    display: block !important;
                    border: none !important;
                    border-bottom: 1px solid #e2e8f0 !important;
                    background-color: #f8fafc;
                }
                .quill-wrapper .ql-container {
                    border: none !important;
                    font-family: inherit;
                    font-size: inherit;
                }
                .quill-wrapper .ql-editor {
                    min-height: auto;
                    padding: 1rem;
                    overflow-y: hidden;
                    color: #334155;
                }
                .quill-wrapper.is-focused .ql-editor {
                    min-height: 150px;
                }
                .quill-wrapper .ql-editor.ql-blank::before {
                    font-style: normal;
                    color: #94a3b8;
                    position: static;
                    white-space: pre-wrap;
                    display: block;
                }
            `}</style>
            <ReactQuill 
                theme="snow" 
                value={value} 
                onChange={onChange} 
                onFocus={() => setIsFocused(true)}
                placeholder={placeholder}
                modules={MODULES}
                className="quill-custom"
            />
        </div>
    );
};

export default FullFormatText;
