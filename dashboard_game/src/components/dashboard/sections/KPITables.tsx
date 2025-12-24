import React, { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useTheme } from '../../../contexts/ThemeContext';
import { AsicKpiUser, RefKpiUser } from '../hooks/useKPITablesData';
import { numberFormat } from '../../../utils/dashboard/formatters';

interface AsicKPITableProps {
  data: AsicKpiUser[];
  selectedUsers: Set<number>;
  onUserSelect: (personId: number, e?: React.MouseEvent) => void;
  onSelectAll: () => void;
  onOpenPushModal: () => void;
  onClose: () => void;
  onLoadUserDetails: (personId: number) => void;
}

export const AsicKPITable: React.FC<AsicKPITableProps> = ({
  data,
  selectedUsers,
  onUserSelect,
  onSelectAll,
  onOpenPushModal,
  onClose,
  onLoadUserDetails
}) => {
  const { isDark } = useTheme();
  
  // Виртуализация для таблицы (только если больше 50 элементов)
  const parentRef = useRef<HTMLDivElement>(null);
  const shouldVirtualize = data.length > 50;
  
  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60, // Примерная высота строки
    overscan: 5,
  });

  return (
    <div className={`mt-6 p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800/50 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Пользователи, которым не хватает 1 ASIC для перехода на следующий уровень
        </h3>
        <div className="flex items-center gap-2">
          {selectedUsers.size > 0 && (
            <button
              onClick={onOpenPushModal}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isDark
                  ? 'bg-blue-700 hover:bg-blue-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Отправить пуш ({selectedUsers.size})
            </button>
          )}
          <button
            onClick={onClose}
            className={`px-3 py-1 rounded text-sm ${
              isDark 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            ✕
          </button>
        </div>
      </div>
      <div className="mb-3 flex items-center gap-2">
        <button
          onClick={onSelectAll}
          className={`text-sm px-3 py-1 rounded ${
            isDark
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          {selectedUsers.size === data.length ? 'Снять все' : 'Выбрать все'}
        </button>
        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Выбрано: {selectedUsers.size} из {data.length}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <th className={`py-2 px-2 text-center font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} w-12`}>
                <input
                  type="checkbox"
                  checked={selectedUsers.size === data.length && data.length > 0}
                  onChange={onSelectAll}
                  className="cursor-pointer"
                />
              </th>
              <th className={`text-left py-2 px-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>ID</th>
              <th className={`text-left py-2 px-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Пользователь</th>
              <th className={`text-center py-2 px-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Уровень</th>
              <th className={`text-center py-2 px-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>ASIC</th>
              <th className={`text-center py-2 px-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Нужно для след. уровня</th>
              <th className={`text-center py-2 px-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Не хватает</th>
              <th className={`text-center py-2 px-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Прогресс</th>
            </tr>
          </thead>
          <tbody
            style={shouldVirtualize ? {
              height: `${rowVirtualizer.getTotalSize()}px`,
              position: 'relative',
            } : undefined}
          >
            {shouldVirtualize ? (
              <>
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const user = data[virtualRow.index];
                  const idx = virtualRow.index;
                  return (
                    <tr 
                      key={user.person_id || idx}
                      data-index={virtualRow.index}
                      ref={rowVirtualizer.measureElement}
                      className={`border-b absolute w-full ${isDark ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'}`}
                      style={{
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                <td 
                  className="py-2 px-2 text-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUserSelect(user.person_id, e);
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(user.person_id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      onUserSelect(user.person_id, e);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="cursor-pointer w-4 h-4"
                  />
                </td>
                <td className={`py-2 px-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {user.person_id}
                </td>
                <td className={`py-2 px-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <div className="flex items-center gap-2">
                    {user.tg_photo_url && (
                      <img 
                        src={user.tg_photo_url} 
                        alt={user.username || user.first_name}
                        className="w-6 h-6 rounded-full"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    )}
                    <div>
                      <div className="font-medium">{user.first_name} {user.last_name || ''}</div>
                      {user.username && (
                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          @{user.username}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className={`py-2 px-3 text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                    user.current_level === 0
                      ? isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                      : user.current_level <= 3
                      ? isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800'
                      : user.current_level <= 6
                      ? isDark ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-800'
                      : isDark ? 'bg-orange-900/50 text-orange-300' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {user.current_level}
                  </span>
                </td>
                <td className={`py-2 px-3 text-center font-semibold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                  {user.total_asics || 0}
                </td>
                <td className={`py-2 px-3 text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  {user.required_asics_for_next_level || '—'}
                </td>
                <td className={`py-2 px-3 text-center font-semibold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                  {user.missing_asics || 0}
                </td>
                <td className={`py-2 px-3 text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <div className="flex items-center gap-2">
                    <div className={`flex-1 h-2 rounded-full overflow-hidden ${
                      isDark ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                      <div 
                        className={`h-full ${
                          user.progress_percent >= 100
                            ? 'bg-green-500'
                            : user.progress_percent >= 75
                            ? 'bg-yellow-500'
                            : 'bg-orange-500'
                        }`}
                        style={{ width: `${Math.min(user.progress_percent || 0, 100)}%` }}
                      ></div>
                    </div>
                    <span className="text-xs font-medium min-w-[3rem]">
                      {user.progress_percent ? user.progress_percent.toFixed(1) : '0'}%
                    </span>
                  </div>
                </td>
              </tr>
                    );
                  })}
                </>
              ) : (
                <>
                  {data.map((user, idx) => (
                    <tr 
                      key={user.person_id || idx} 
                      className={`border-b ${isDark ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'}`}
                    >
                      <td 
                        className="py-2 px-2 text-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUserSelect(user.person_id, e);
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(user.person_id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            onUserSelect(user.person_id, e);
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="cursor-pointer w-4 h-4"
                        />
                      </td>
                      <td className={`py-2 px-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {user.person_id}
                      </td>
                      <td className={`py-2 px-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        <div className="flex items-center gap-2">
                          {user.tg_photo_url && (
                            <img 
                              src={user.tg_photo_url} 
                              alt={user.username || user.first_name}
                              className="w-6 h-6 rounded-full"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          )}
                          <div>
                            <div className="font-medium">{user.first_name} {user.last_name || ''}</div>
                            {user.username && (
                              <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                @{user.username}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className={`py-2 px-3 text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                          user.current_level === 0
                            ? isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                            : user.current_level <= 3
                            ? isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800'
                            : user.current_level <= 6
                            ? isDark ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-800'
                            : isDark ? 'bg-orange-900/50 text-orange-300' : 'bg-orange-100 text-orange-800'
                        }`}>
                          {user.current_level}
                        </span>
                      </td>
                      <td className={`py-2 px-3 text-center font-semibold ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                        {user.total_asics || 0}
                      </td>
                      <td className={`py-2 px-3 text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {user.required_asics_for_next_level || '—'}
                      </td>
                      <td className={`py-2 px-3 text-center font-semibold ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                        {user.missing_asics || 0}
                      </td>
                      <td className={`py-2 px-3 text-center ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        <div className="flex items-center gap-2">
                          <div className={`flex-1 h-2 rounded-full overflow-hidden ${
                            isDark ? 'bg-gray-700' : 'bg-gray-200'
                          }`}>
                            <div 
                              className={`h-full ${
                                user.progress_percent >= 100
                                  ? 'bg-green-500'
                                  : user.progress_percent >= 75
                                  ? 'bg-yellow-500'
                                  : 'bg-orange-500'
                              }`}
                              style={{ width: `${Math.min(user.progress_percent || 0, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-medium min-w-[3rem]">
                            {user.progress_percent ? user.progress_percent.toFixed(1) : '0'}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </>
              )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface RefKPITableProps {
  data: RefKpiUser[];
  selectedUsers: Set<number>;
  onUserSelect: (personId: number, e?: React.MouseEvent) => void;
  onSelectAll: () => void;
  onOpenPushModal: () => void;
  onClose: () => void;
  onLoadUserDetails: (personId: number) => void;
  level: number;
  title: string;
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return 'N/A';
  }
};

export const RefKPITable: React.FC<RefKPITableProps> = ({
  data,
  selectedUsers,
  onUserSelect,
  onSelectAll,
  onOpenPushModal,
  onClose,
  onLoadUserDetails,
  level,
  title
}) => {
  const { isDark } = useTheme();
  
  // Виртуализация для таблицы (только если больше 50 элементов)
  const parentRef = useRef<HTMLDivElement>(null);
  const shouldVirtualize = data.length > 50;
  
  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60, // Примерная высота строки
    overscan: 5,
  });

  return (
    <div className={`mt-6 p-6 rounded-xl shadow-lg ${isDark ? 'bg-gray-800/50 border border-gray-700' : 'bg-gray-50 border border-gray-200'}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h3>
        <div className="flex items-center gap-2">
          {selectedUsers.size > 0 && (
            <button
              onClick={onOpenPushModal}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isDark
                  ? 'bg-blue-700 hover:bg-blue-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              Отправить пуш ({selectedUsers.size})
            </button>
          )}
          <button
            onClick={onClose}
            className={`px-3 py-1 rounded text-sm ${
              isDark 
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            Скрыть
          </button>
        </div>
      </div>
      <div className="mb-3 flex items-center gap-2">
        <button
          onClick={onSelectAll}
          className={`text-sm px-3 py-1 rounded ${
            isDark
              ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
          }`}
        >
          {selectedUsers.size === data.length ? 'Снять все' : 'Выбрать все'}
        </button>
        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Выбрано: {selectedUsers.size} из {data.length}
        </span>
      </div>
      <div 
        ref={shouldVirtualize ? parentRef : undefined}
        className={`overflow-x-auto ${shouldVirtualize ? 'overflow-y-auto' : ''}`}
        style={shouldVirtualize ? { maxHeight: '60vh' } : undefined}
      >
        <table className="w-full text-sm">
          <thead className={shouldVirtualize ? 'sticky top-0 z-10' : ''}>
            <tr className={`border-b ${isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
              <th className={`py-2 px-2 text-center font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} w-12`}>
                <input
                  type="checkbox"
                  checked={selectedUsers.size === data.length && data.length > 0}
                  onChange={onSelectAll}
                  className="cursor-pointer"
                />
              </th>
              <th className={`py-2 px-2 text-left font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>ID</th>
              <th className={`py-2 px-2 text-left font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Аватар</th>
              <th className={`py-2 px-2 text-left font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} max-w-[200px]`}>Имя</th>
              <th className={`py-2 px-2 text-left font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'} max-w-[120px]`}>TG ID</th>
              <th className={`py-2 px-2 text-center font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Уровень</th>
              <th className={`py-2 px-2 text-center font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Th</th>
              <th className={`py-2 px-2 text-center font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>ASIC</th>
              <th className={`py-2 px-2 text-center font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Рефералов</th>
              <th className={`py-2 px-2 text-left font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Дата регистрации</th>
            </tr>
          </thead>
          <tbody
            style={shouldVirtualize ? {
              height: `${rowVirtualizer.getTotalSize()}px`,
              position: 'relative',
            } : undefined}
          >
            {shouldVirtualize ? (
              <>
                {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                  const user = data[virtualRow.index];
                  return (
                    <tr 
                      key={user.person_id}
                      data-index={virtualRow.index}
                      ref={rowVirtualizer.measureElement}
                      className={`border-b absolute w-full ${isDark ? 'border-gray-700 hover:bg-gray-800/50' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
                      style={{
                        height: `${virtualRow.size}px`,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                <td 
                  className="py-2 px-2 text-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUserSelect(user.person_id);
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedUsers.has(user.person_id)}
                    onChange={(e) => {
                      e.stopPropagation();
                      onUserSelect(user.person_id);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="cursor-pointer w-4 h-4"
                  />
                </td>
                <td 
                  className={`py-2 px-2 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} cursor-pointer`}
                  onClick={() => onLoadUserDetails(user.person_id)}
                >
                  {user.person_id}
                </td>
                <td 
                  className="py-2 px-2 cursor-pointer"
                  onClick={() => onLoadUserDetails(user.person_id)}
                >
                  {user.tg_photo_url ? (
                    <img 
                      src={user.tg_photo_url} 
                      alt={user.username || user.first_name}
                      className="w-8 h-8 rounded-full"
                      loading="lazy"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.onerror = null;
                      }}
                    />
                  ) : (
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {user.first_name?.[0]?.toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                </td>
                <td 
                  className={`py-2 px-2 ${isDark ? 'text-gray-300' : 'text-gray-700'} max-w-[200px] cursor-pointer`}
                  onClick={() => onLoadUserDetails(user.person_id)}
                >
                  <div className="flex flex-col">
                    <span className="font-medium truncate">{user.first_name} {user.last_name}</span>
                    {user.username && (
                      <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} truncate`}>@{user.username}</span>
                    )}
                  </div>
                </td>
                <td 
                  className={`py-2 px-2 font-mono text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} max-w-[120px] truncate cursor-pointer`}
                  onClick={() => onLoadUserDetails(user.person_id)}
                >
                  {user.tg_id || '—'}
                </td>
                <td 
                  className="py-2 px-2 text-center cursor-pointer"
                  onClick={() => onLoadUserDetails(user.person_id)}
                >
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                    user.current_level === 0
                      ? isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                      : user.current_level <= 3
                      ? isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800'
                      : user.current_level <= 6
                      ? isDark ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-800'
                      : isDark ? 'bg-orange-900/50 text-orange-300' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {user.current_level}
                  </span>
                </td>
                <td 
                  className={`py-2 px-2 text-center font-semibold ${isDark ? 'text-indigo-400' : 'text-indigo-600'} cursor-pointer`}
                  onClick={() => onLoadUserDetails(user.person_id)}
                >
                  {numberFormat(parseFloat(user.effective_ths || '0'))}
                </td>
                <td 
                  className={`py-2 px-2 text-center font-semibold ${isDark ? 'text-indigo-400' : 'text-indigo-600'} cursor-pointer`}
                  onClick={() => onLoadUserDetails(user.person_id)}
                >
                  {user.total_asics || 0}
                </td>
                <td 
                  className={`py-2 px-2 text-center font-semibold ${isDark ? 'text-red-400' : 'text-red-600'} cursor-pointer`}
                  onClick={() => onLoadUserDetails(user.person_id)}
                >
                  {user.total_referrals || 0}
                </td>
                <td 
                  className={`py-2 px-2 ${isDark ? 'text-gray-400' : 'text-gray-600'} cursor-pointer`}
                  onClick={() => onLoadUserDetails(user.person_id)}
                >
                  {user.person_created_at ? formatDate(user.person_created_at) : '—'}
                </td>
              </tr>
                  );
                })}
              </>
            ) : (
              <>
                {data.map((user) => (
                  <tr 
                    key={user.person_id} 
                    className={`border-b ${isDark ? 'border-gray-700 hover:bg-gray-800/50' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
                  >
                    <td 
                      className="py-2 px-2 text-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUserSelect(user.person_id);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user.person_id)}
                        onChange={(e) => {
                          e.stopPropagation();
                          onUserSelect(user.person_id);
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                        className="cursor-pointer w-4 h-4"
                      />
                    </td>
                    <td 
                      className={`py-2 px-2 font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} cursor-pointer`}
                      onClick={() => onLoadUserDetails(user.person_id)}
                    >
                      {user.person_id}
                    </td>
                    <td 
                      className="py-2 px-2 cursor-pointer"
                      onClick={() => onLoadUserDetails(user.person_id)}
                    >
                      {user.tg_photo_url ? (
                        <img 
                          src={user.tg_photo_url} 
                          alt={user.username || user.first_name}
                          className="w-8 h-8 rounded-full"
                          loading="lazy"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.onerror = null;
                          }}
                        />
                      ) : (
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {user.first_name?.[0]?.toUpperCase() || '?'}
                          </span>
                        </div>
                      )}
                    </td>
                    <td 
                      className={`py-2 px-2 ${isDark ? 'text-gray-300' : 'text-gray-700'} max-w-[200px] cursor-pointer`}
                      onClick={() => onLoadUserDetails(user.person_id)}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium truncate">{user.first_name} {user.last_name}</span>
                        {user.username && (
                          <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} truncate`}>@{user.username}</span>
                        )}
                      </div>
                    </td>
                    <td 
                      className={`py-2 px-2 font-mono text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'} max-w-[120px] truncate cursor-pointer`}
                      onClick={() => onLoadUserDetails(user.person_id)}
                    >
                      {user.tg_id || '—'}
                    </td>
                    <td 
                      className="py-2 px-2 text-center cursor-pointer"
                      onClick={() => onLoadUserDetails(user.person_id)}
                    >
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                        user.current_level === 0
                          ? isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                          : user.current_level <= 3
                          ? isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-800'
                          : user.current_level <= 6
                          ? isDark ? 'bg-purple-900/50 text-purple-300' : 'bg-purple-100 text-purple-800'
                          : isDark ? 'bg-orange-900/50 text-orange-300' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {user.current_level}
                      </span>
                    </td>
                    <td 
                      className={`py-2 px-2 text-center font-semibold ${isDark ? 'text-indigo-400' : 'text-indigo-600'} cursor-pointer`}
                      onClick={() => onLoadUserDetails(user.person_id)}
                    >
                      {numberFormat(parseFloat(user.effective_ths || '0'))}
                    </td>
                    <td 
                      className={`py-2 px-2 text-center font-semibold ${isDark ? 'text-indigo-400' : 'text-indigo-600'} cursor-pointer`}
                      onClick={() => onLoadUserDetails(user.person_id)}
                    >
                      {user.total_asics || 0}
                    </td>
                    <td 
                      className={`py-2 px-2 text-center font-semibold ${isDark ? 'text-red-400' : 'text-red-600'} cursor-pointer`}
                      onClick={() => onLoadUserDetails(user.person_id)}
                    >
                      {user.total_referrals || 0}
                    </td>
                    <td 
                      className={`py-2 px-2 ${isDark ? 'text-gray-400' : 'text-gray-600'} cursor-pointer`}
                      onClick={() => onLoadUserDetails(user.person_id)}
                    >
                      {user.person_created_at ? formatDate(user.person_created_at) : '—'}
                    </td>
                  </tr>
                ))}
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

