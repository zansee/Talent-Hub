import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Target, CheckCircle2, Calendar, Info, CheckCheck } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { useNotifications } from '../../contexts/NotificationContext';
import { formatRelativeTime } from '../../utils/formatters';
import EmptyState from '../../components/shared/EmptyState';
import Button from '../../components/shared/Button';

const TYPE_CONFIG = {
  job_match: { icon: Target, color: 'text-primary', bg: 'bg-primary/10' },
  application: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10' },
  interview: { icon: Calendar, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  system: { icon: Bell, color: 'text-zinc-300', bg: 'bg-zinc-800' },
};

export const Notifications = () => {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="min-h-full flex flex-col bg-[#12160d] text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-900 sticky top-0 bg-[#12160d]/95 backdrop-blur-md z-10">
        <div className="flex items-center gap-2">
          <h1 className="font-display font-bold text-base">Notifications</h1>
          {unreadCount > 0 && (
            <span className="bg-primary text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1 text-[10px] font-bold text-primary hover:text-white transition-colors cursor-pointer"
          >
            <CheckCheck size={12} />
            Mark all read
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar pb-4">
        {loading ? (
          <div className="flex flex-col gap-3 p-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-zinc-900/50 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState
            pose="celebrating"
            title="You're all caught up!"
            description="No notifications yet. When jobs match your profile or applications update, they'll appear here."
          />
        ) : (
          <div className="flex flex-col divide-y divide-zinc-900/50">
            <AnimatePresence>
              {notifications.map((notif, i) => {
                const cfg = TYPE_CONFIG[notif.type] || TYPE_CONFIG.system;
                const Icon = cfg.icon;
                return (
                  <motion.button
                    key={notif.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => markAsRead(notif.id)}
                    className={`w-full text-left flex items-start gap-3.5 px-5 py-4 hover:bg-zinc-900/40 transition-colors cursor-pointer ${
                      !notif.is_read ? 'bg-zinc-900/20' : ''
                    }`}
                  >
                    {/* Icon circle */}
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${cfg.bg}`}>
                      <Icon size={16} className={cfg.color} />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold leading-snug ${!notif.is_read ? 'text-white' : 'text-zinc-300'}`}>
                        {notif.title}
                      </p>
                      <p className="text-[10px] text-zinc-400 font-sans mt-0.5 leading-relaxed line-clamp-2">
                        {notif.body}
                      </p>
                      <span className="text-[9px] text-zinc-600 font-semibold mt-1 block">
                        {formatRelativeTime(notif.created_at)}
                      </span>
                    </div>

                    {/* Unread dot */}
                    {!notif.is_read && (
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                    )}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
