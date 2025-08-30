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