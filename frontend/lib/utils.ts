import { type ClassValue, clsx } from 'clsx';
import { formatEther, parseEther } from 'viem';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatETH(value: bigint, decimals = 4): string {
  const formatted = formatEther(value);
  const number = parseFloat(formatted);
  return number.toFixed(decimals);
}

export function parseETH(value: string): bigint {
  return parseEther(value);
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.slice(0, 2 + chars)}...${address.slice(-chars)}`;
}

export function formatDate(timestamp: bigint): string {
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleDateString();
}

export function formatDateTime(timestamp: bigint): string {
  const date = new Date(Number(timestamp) * 1000);
  return date.toLocaleString();
}

export function getRelativeTime(date: Date | string | number): string {
  const now = new Date();
  const then = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
  const diffMs = now.getTime() - then.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  
  // For older dates, show the actual date
  return then.toLocaleDateString();
}