import React, { useEffect, useRef } from 'react';

import classNames from 'clsx';

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const TextArea: React.FC<TextAreaProps> = ({ className, value, ...props }) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textAreaRef.current) {
      // We need to reset the height momentarily to get the correct scrollHeight for the textarea
      textAreaRef.current.style.height = '0px';
      const scrollHeight = textAreaRef.current.scrollHeight;

      // We then set the height directly, outside of the render loop
      // Trying to set this with state or a ref will product an incorrect value.
      textAreaRef.current.style.height = scrollHeight + 'px';
    }
  }, [textAreaRef, value]);

  return (
    <textarea
      ref={textAreaRef}
      value={value}
      {...props}
      className={classNames(
        // radius-sm (8px) is the input step on the Crust scale. The arbitrary
        // 10px this replaces is one of the values the system retires.
        'border rounded-sm-token border-border-light ',
        'transition-colors duration-150 ease-hover',
        'min-h-[48px] p-3',
        'resize-none overflow-hidden',
        'bg-white text-black',
        'placeholder-grey-400 font-base text-base',
        'border border-border-light hover:border-border-light',
        'hover:border-border-light',
        'outline-none',
        'focus:border-black focus:ring-1 focus:ring-black',
        'active:border-black',
        className
      )}
    />
  );
};
