import React from 'react';
import { 
  Pickaxe, Coins, ShoppingCart, Calendar, DollarSign, ArrowLeftRight, 
  Target, CheckCircle, Megaphone, Smartphone, Star, Repeat, Monitor, 
  Laptop, Building2, Zap, Mountain, Wallet, CalendarDays, Diamond, 
  Gamepad2, Trophy, Medal, ThumbsUp, Heart, Pointer, PartyPopper, 
  Globe, Gift, Users, UserPlus, CreditCard, Award
} from 'lucide-react';

interface EventIconProps {
  name: string;
  className?: string;
  color?: string;
}

/**
 * Компонент для отображения иконок событий
 */
export const EventIcon: React.FC<EventIconProps> = ({ 
  name, 
  className = "w-5 h-5", 
  color 
}) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    'mining': <Pickaxe className={className} style={{ color }} />,
    'coins': <Coins className={className} style={{ color }} />,
    'cart': <ShoppingCart className={className} style={{ color }} />,
    'calendar': <Calendar className={className} style={{ color }} />,
    'dollar': <DollarSign className={className} style={{ color }} />,
    'swap': <ArrowLeftRight className={className} style={{ color }} />,
    'target': <Target className={className} style={{ color }} />,
    'check': <CheckCircle className={className} style={{ color }} />,
    'megaphone': <Megaphone className={className} style={{ color }} />,
    'phone': <Smartphone className={className} style={{ color }} />,
    'star': <Star className={className} style={{ color }} />,
    'exchange': <Repeat className={className} style={{ color }} />,
    'monitor': <Monitor className={className} style={{ color }} />,
    'laptop': <Laptop className={className} style={{ color }} />,
    'building': <Building2 className={className} style={{ color }} />,
    'zap': <Zap className={className} style={{ color }} />,
    'mountain': <Mountain className={className} style={{ color }} />,
    'wallet': <Wallet className={className} style={{ color }} />,
    'calendar-days': <CalendarDays className={className} style={{ color }} />,
    'diamond': <Diamond className={className} style={{ color }} />,
    'gamepad': <Gamepad2 className={className} style={{ color }} />,
    'trophy': <Trophy className={className} style={{ color }} />,
    'medal': <Medal className={className} style={{ color }} />,
    'thumb': <ThumbsUp className={className} style={{ color }} />,
    'heart': <Heart className={className} style={{ color }} />,
    'pointer': <Pointer className={className} style={{ color }} />,
    'party': <PartyPopper className={className} style={{ color }} />,
    'globe': <Globe className={className} style={{ color }} />,
    'gift': <Gift className={className} style={{ color }} />,
    'users': <Users className={className} style={{ color }} />,
    'user-plus': <UserPlus className={className} style={{ color }} />,
    'card': <CreditCard className={className} style={{ color }} />,
    'award': <Award className={className} style={{ color }} />,
  };
  
  return <>{iconMap[name] || <Zap className={className} style={{ color }} />}</>;
};

