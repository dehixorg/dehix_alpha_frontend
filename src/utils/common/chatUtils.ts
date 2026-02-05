import React from 'react';
import { Mic, Image as ImageIcon, Video, Music2, FileText } from 'lucide-react';

/**
 * Strips HTML tags from a string and handles basic entities.
 */
export const stripHtml = (html: string): string =>
    (html || '')
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim();

/**
 * Utility function to detect and format media/message previews.
 */
export const getLastMessagePreview = (lastMessage: any) => {
    if (!lastMessage) return { text: 'No messages yet', icon: null };

    if (lastMessage.voiceMessage) {
        return {
            text: 'Voice message',
            icon: React.createElement(Mic, { className: "h-3.5 w-3.5 inline mr-1" }),
        };
    }

    // Check for attachments by content-type (MIME type)
    if (lastMessage.attachments && Array.isArray(lastMessage.attachments) && lastMessage.attachments.length > 0) {
        const type = lastMessage.attachments[0]?.type || '';
        if (type.startsWith('image/')) {
            return {
                text: 'Photo',
                icon: React.createElement(ImageIcon, { className: "h-3.5 w-3.5 inline mr-1" }),
            };
        }
        if (type.startsWith('video/')) {
            return {
                text: 'Video',
                icon: React.createElement(Video, { className: "h-3.5 w-3.5 inline mr-1" }),
            };
        }
        if (type.startsWith('audio/')) {
            return {
                text: 'Audio',
                icon: React.createElement(Music2, { className: "h-3.5 w-3.5 inline mr-1" }),
            };
        }
        return {
            text: 'File',
            icon: React.createElement(FileText, { className: "h-3.5 w-3.5 inline mr-1" }),
        };
    }

    // Fallback to checking S3 URLs/extensions if type is not available
    const content = lastMessage.content || '';
    const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp'];
    const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
    const audioExtensions = ['mp3', 'wav', 'aac', 'ogg', 'flac'];

    const getExt = (raw: string) => {
        try {
            if (raw.startsWith('http')) {
                const url = new URL(raw);
                return url.pathname.split('.').pop()?.toLowerCase() || '';
            }
            return raw.split('?')[0].split('.').pop()?.toLowerCase() || '';
        } catch {
            return '';
        }
    };

    const ext = getExt(content);
    if (imageExtensions.includes(ext)) {
        return {
            text: 'Photo',
            icon: React.createElement(ImageIcon, { className: "h-3.5 w-3.5 inline mr-1" }),
        };
    }
    if (videoExtensions.includes(ext)) {
        return {
            text: 'Video',
            icon: React.createElement(Video, { className: "h-3.5 w-3.5 inline mr-1" }),
        };
    }
    if (audioExtensions.includes(ext)) {
        return {
            text: 'Audio',
            icon: React.createElement(Music2, { className: "h-3.5 w-3.5 inline mr-1" }),
        };
    }

    const stripped = stripHtml(content);
    return { text: stripped || 'Message', icon: null };
};
