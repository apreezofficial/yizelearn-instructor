import React from 'react';
import {HugeiconsIcon} from '@hugeicons/react-native';
import Add01Icon from '@hugeicons/core-free-icons/Add01Icon';
import Alert02Icon from '@hugeicons/core-free-icons/Alert02Icon';
import AppleIcon from '@hugeicons/core-free-icons/AppleIcon';
import ArrowDown01Icon from '@hugeicons/core-free-icons/ArrowDown01Icon';
import ArrowLeft01Icon from '@hugeicons/core-free-icons/ArrowLeft01Icon';
import ArrowRight01Icon from '@hugeicons/core-free-icons/ArrowRight01Icon';
import ArrowUp01Icon from '@hugeicons/core-free-icons/ArrowUp01Icon';
import ArrowUpDownIcon from '@hugeicons/core-free-icons/ArrowUpDownIcon';
import Attachment01Icon from '@hugeicons/core-free-icons/Attachment01Icon';
import Award01Icon from '@hugeicons/core-free-icons/Award01Icon';
import BankIcon from '@hugeicons/core-free-icons/BankIcon';
import BookOpen01Icon from '@hugeicons/core-free-icons/BookOpen01Icon';
import Calendar01Icon from '@hugeicons/core-free-icons/Calendar01Icon';
import Cancel01Icon from '@hugeicons/core-free-icons/Cancel01Icon';
import Certificate01Icon from '@hugeicons/core-free-icons/Certificate01Icon';
import CheckListIcon from '@hugeicons/core-free-icons/CheckListIcon';
import Clock01Icon from '@hugeicons/core-free-icons/Clock01Icon';
import CreditCardIcon from '@hugeicons/core-free-icons/CreditCardIcon';
import DashboardSquare01Icon from '@hugeicons/core-free-icons/DashboardSquare01Icon';
import Delete02Icon from '@hugeicons/core-free-icons/Delete02Icon';
import Download01Icon from '@hugeicons/core-free-icons/Download01Icon';
import DragDropVerticalIcon from '@hugeicons/core-free-icons/DragDropVerticalIcon';
import Edit02Icon from '@hugeicons/core-free-icons/Edit02Icon';
import FavouriteIcon from '@hugeicons/core-free-icons/FavouriteIcon';
import FileAttachmentIcon from '@hugeicons/core-free-icons/FileAttachmentIcon';
import FilterHorizontalIcon from '@hugeicons/core-free-icons/FilterHorizontalIcon';
import GoogleIcon from '@hugeicons/core-free-icons/GoogleIcon';
import Home01Icon from '@hugeicons/core-free-icons/Home01Icon';
import Image01Icon from '@hugeicons/core-free-icons/Image01Icon';
import Infinity01Icon from '@hugeicons/core-free-icons/Infinity01Icon';
import Logout01Icon from '@hugeicons/core-free-icons/Logout01Icon';
import Mail01Icon from '@hugeicons/core-free-icons/Mail01Icon';
import Medal01Icon from '@hugeicons/core-free-icons/Medal01Icon';
import Message01Icon from '@hugeicons/core-free-icons/Message01Icon';
import Money01Icon from '@hugeicons/core-free-icons/Money01Icon';
import MoreHorizontalIcon from '@hugeicons/core-free-icons/MoreHorizontalIcon';
import Notification01Icon from '@hugeicons/core-free-icons/Notification01Icon';
import Pdf01Icon from '@hugeicons/core-free-icons/Pdf01Icon';
import PlayIcon from '@hugeicons/core-free-icons/PlayIcon';
import Quiz01Icon from '@hugeicons/core-free-icons/Quiz01Icon';
import Refresh01Icon from '@hugeicons/core-free-icons/Refresh01Icon';
import Search01Icon from '@hugeicons/core-free-icons/Search01Icon';
import SentIcon from '@hugeicons/core-free-icons/SentIcon';
import Settings01Icon from '@hugeicons/core-free-icons/Settings01Icon';
import Share01Icon from '@hugeicons/core-free-icons/Share01Icon';
import ShoppingCart01Icon from '@hugeicons/core-free-icons/ShoppingCart01Icon';
import SquareLock02Icon from '@hugeicons/core-free-icons/SquareLock02Icon';
import StarIcon from '@hugeicons/core-free-icons/StarIcon';
import Target01Icon from '@hugeicons/core-free-icons/Target01Icon';
import Tick02Icon from '@hugeicons/core-free-icons/Tick02Icon';
import Upload01Icon from '@hugeicons/core-free-icons/Upload01Icon';
import UserGroupIcon from '@hugeicons/core-free-icons/UserGroupIcon';
import UserIcon from '@hugeicons/core-free-icons/UserIcon';
import Video01Icon from '@hugeicons/core-free-icons/Video01Icon';
import LaptopIcon from '@hugeicons/core-free-icons/LaptopIcon';
import Message02Icon from '@hugeicons/core-free-icons/Message02Icon';
import ChartColumnIcon from '@hugeicons/core-free-icons/ChartColumnIcon';
import Menu01Icon from '@hugeicons/core-free-icons/Menu01Icon';
import File01Icon from '@hugeicons/core-free-icons/File01Icon';
import SecurityCheckIcon from '@hugeicons/core-free-icons/SecurityCheckIcon';
import Building03Icon from '@hugeicons/core-free-icons/Building03Icon';
import School01Icon from '@hugeicons/core-free-icons/School01Icon';
import {colors} from '../theme/tokens';

// App icon names mapped to Hugeicons. `filled` renders the same outline icon with a solid fill.
const icons = {
  search: {icon: Search01Icon},
  filter: {icon: FilterHorizontalIcon},
  sort: {icon: ArrowUpDownIcon},
  back: {icon: ArrowLeft01Icon},
  down: {icon: ArrowDown01Icon},
  up: {icon: ArrowUp01Icon},
  heart: {icon: FavouriteIcon},
  heartFilled: {icon: FavouriteIcon, filled: true},
  star: {icon: StarIcon},
  starFilled: {icon: StarIcon, filled: true},
  check: {icon: Tick02Icon},
  play: {icon: PlayIcon, filled: true},
  lock: {icon: SquareLock02Icon},
  home: {icon: Home01Icon},
  book: {icon: BookOpen01Icon},
  cart: {icon: ShoppingCart01Icon},
  user: {icon: UserIcon},
  message: {icon: Message01Icon},
  close: {icon: Cancel01Icon},
  certificate: {icon: Certificate01Icon},
  infinity: {icon: Infinity01Icon},
  card: {icon: CreditCardIcon},
  bank: {icon: BankIcon},
  google: {icon: GoogleIcon},
  apple: {icon: AppleIcon},
  bell: {icon: Notification01Icon},
  upload: {icon: Upload01Icon},
  send: {icon: SentIcon},
  share: {icon: Share01Icon},
  download: {icon: Download01Icon},
  award: {icon: Award01Icon},
  medal: {icon: Medal01Icon},
  target: {icon: Target01Icon},
  calendar: {icon: Calendar01Icon},
  edit: {icon: Edit02Icon},
  clock: {icon: Clock01Icon},
  attach: {icon: Attachment01Icon},
  mail: {icon: Mail01Icon},
  settings: {icon: Settings01Icon},
  logout: {icon: Logout01Icon},
  next: {icon: ArrowRight01Icon},
  dashboard: {icon: DashboardSquare01Icon},
  users: {icon: UserGroupIcon},
  more: {icon: MoreHorizontalIcon},
  shield: {icon: SecurityCheckIcon},
  building: {icon: Building03Icon},
  school: {icon: School01Icon},
  plus: {icon: Add01Icon},
  drag: {icon: DragDropVerticalIcon},
  trash: {icon: Delete02Icon},
  video: {icon: Video01Icon},
  document: {icon: FileAttachmentIcon},
  quiz: {icon: Quiz01Icon},
  assignment: {icon: CheckListIcon},
  alert: {icon: Alert02Icon},
  money: {icon: Money01Icon},
  pdf: {icon: Pdf01Icon},
  image: {icon: Image01Icon},
  refresh: {icon: Refresh01Icon},
  edit2: {icon: Edit02Icon},
  chart: {icon: ChartColumnIcon},
  laptop: {icon: LaptopIcon},
  chat: {icon: Message02Icon},
  handle: {icon: Menu01Icon},
  file: {icon: File01Icon},
} as const;

export type IconName = keyof typeof icons;

export function Icon({name, size = 24, color = colors.ink, strokeWidth = 1.8, solid}: {name: IconName; size?: number; color?: string; strokeWidth?: number; solid?: boolean}) {
  const {icon, filled: mapped} = icons[name] as {icon: typeof StarIcon; filled?: boolean};
  const filled = solid ?? mapped;
  return <HugeiconsIcon icon={icon} size={size} color={color} strokeWidth={strokeWidth} fill={filled ? color : 'none'} />;
}
