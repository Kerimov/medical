'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  RefreshCw, 
  Database, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  Clock,
  BookOpen,
  Activity
} from 'lucide-react';

interface MedicalSource {
  name: string;
  url: string;
  description: string;
  type: 'api' | 'web' | 'database';
}

interface SearchResult {
  query: string;
  found: number;
  saved: number;
  success: boolean;
  error?: string;
}

interface SyncStats {
  studyTypes: number;
  indicators: number;
  lastStudyTypeUpdate: string | null;
  lastIndicatorUpdate: string | null;
}

export default function KnowledgeSyncPage() {
  const { user, loading, token } = useAuth();
  const router = useRouter();
  
  const [sources, setSources] = useState<MedicalSource[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>(['uptodate', 'pubmed']);
  const [searchQuery, setSearchQuery] = useState('');
  const [syncQueries, setSyncQueries] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [syncResults, setSyncResults] = useState<SearchResult[]>([]);
  const [syncStats, setSyncStats] = useState<SyncStats | null>(null);

  useEffect(() => {
    // Проверяем токен в localStorage
    const hasToken = typeof window !== 'undefined' && localStorage.getItem('token');
    
    // Перенаправляем только если загрузка завершена, нет токена и (нет пользователя или он не админ)
    if (!loading && !hasToken && (!user || user.role !== 'ADMIN')) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (token) {
      fetchSources();
      fetchSyncStats();
    }
  }, [token]);

  const fetchSources = async () => {
    try {
      const response = await fetch('/api/knowledge/search', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSources(data.sources);
      }
    } catch (error) {
      console.error('Error fetching sources:', error);
    }
  };

  const fetchSyncStats = async () => {
    try {
      const response = await fetch('/api/knowledge/sync', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSyncStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching sync stats:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch('/api/knowledge/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          query: searchQuery,
          sources: selectedSources
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.results);
      } else {
        console.error('Search failed');
      }
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSync = async () => {
    if (!syncQueries.trim()) return;

    const queries = syncQueries.split('\n').filter(q => q.trim());
    if (queries.length === 0) return;

    setIsSyncing(true);
    setSyncResults([]);
    
    try {
      const response = await fetch('/api/knowledge/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          queries,
          sources: selectedSources
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSyncResults(data.results);
        fetchSyncStats(); // Обновляем статистику
      } else {
        console.error('Sync failed');
      }
    } catch (error) {
      console.error('Error syncing:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleSource = (sourceName: string) => {
    setSelectedSources(prev => 
      prev.includes(sourceName) 
        ? prev.filter(s => s !== sourceName)
        : [...prev, sourceName]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return null; // Перенаправление произойдет через useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <main className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              <RefreshCw className="w-8 h-8" />
              Синхронизация базы знаний
            </h1>
            <p className="text-gray-600 mt-2">
              Поиск и обновление медицинских данных из внешних источников
            </p>
          </div>
        </div>

        {/* Статистика */}
        {syncStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">Типы исследований</p>
                    <p className="text-2xl font-bold">{syncStats.studyTypes}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm text-gray-600">Показатели</p>
                    <p className="text-2xl font-bold">{syncStats.indicators}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-sm text-gray-600">Последнее обновление</p>
                    <p className="text-sm font-medium">
                      {syncStats.lastStudyTypeUpdate 
                        ? new Date(syncStats.lastStudyTypeUpdate).toLocaleDateString('ru-RU')
                        : 'Никогда'
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-gray-600">Источники</p>
                    <p className="text-2xl font-bold">{sources.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Поиск */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Поиск знаний
              </CardTitle>
              <CardDescription>
                Поиск медицинской информации в источниках
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="searchQuery">Запрос</Label>
                <Input
                  id="searchQuery"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Например: общий анализ крови, гемоглобин, глюкоза..."
                />
              </div>

              <div>
                <Label>Источники</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {sources.map((source) => (
                    <Badge
                      key={source.name}
                      variant={selectedSources.includes(source.name.toLowerCase()) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleSource(source.name.toLowerCase())}
                    >
                      {source.name}
                    </Badge>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleSearch} 
                disabled={isSearching || !searchQuery.trim()}
                className="w-full"
              >
                {isSearching ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Поиск...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Найти
                  </>
                )}
              </Button>

              {/* Результаты поиска */}
              {searchResults.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Результаты поиска:</h4>
                  <div className="space-y-2">
                    {searchResults.map((result, index) => (
                      <div key={index} className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium">
                          Источник: {result.sources?.primary?.name}
                        </p>
                        {result.studyType && (
                          <p className="text-sm text-gray-600">
                            Найдено: {result.studyType.name}
                          </p>
                        )}
                        {result.indicators && (
                          <p className="text-sm text-gray-600">
                            Показателей: {result.indicators.length}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Синхронизация */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Синхронизация базы
              </CardTitle>
              <CardDescription>
                Обновление базы знаний из источников
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="syncQueries">Запросы для синхронизации</Label>
                <Textarea
                  id="syncQueries"
                  value={syncQueries}
                  onChange={(e) => setSyncQueries(e.target.value)}
                  placeholder="Введите запросы по одному на строку:&#10;общий анализ крови&#10;биохимический анализ&#10;гемоглобин&#10;глюкоза"
                  rows={6}
                />
              </div>

              <Button 
                onClick={handleSync} 
                disabled={isSyncing || !syncQueries.trim()}
                className="w-full"
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Синхронизация...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4 mr-2" />
                    Синхронизировать
                  </>
                )}
              </Button>

              {/* Результаты синхронизации */}
              {syncResults.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Результаты синхронизации:</h4>
                  <div className="space-y-2">
                    {syncResults.map((result, index) => (
                      <div key={index} className="p-3 rounded-lg flex items-center gap-2">
                        {result.success ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{result.query}</p>
                          {result.success ? (
                            <p className="text-sm text-gray-600">
                              Найдено: {result.found}, Сохранено: {result.saved}
                            </p>
                          ) : (
                            <p className="text-sm text-red-600">{result.error}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Список источников */}
        <Card>
          <CardHeader>
            <CardTitle>Доступные источники</CardTitle>
            <CardDescription>
              Медицинские источники для поиска и синхронизации данных
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sources.map((source) => (
                <div key={source.name} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <ExternalLink className="h-4 w-4 text-blue-600" />
                    <h4 className="font-medium">{source.name}</h4>
                    <Badge variant="outline" className="text-xs">
                      {source.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{source.description}</p>
                  <a 
                    href={source.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    {source.url}
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
