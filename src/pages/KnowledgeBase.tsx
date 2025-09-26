import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Eye, ThumbsUp, ThumbsDown, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiService } from '../services/api';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Badge } from '../components/ui/Badge';
import { formatDate } from '../utils';
import type { KnowledgeArticle, Category } from '../types';

export function KnowledgeBase() {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [filteredArticles, setFilteredArticles] = useState<KnowledgeArticle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [articlesData, categoriesData] = await Promise.all([
          apiService.getKnowledgeArticles(),
          apiService.getCategories(),
        ]);
        setArticles(articlesData);
        setFilteredArticles(articlesData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to fetch knowledge base data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = articles;

    if (searchTerm) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(article => article.categoryId === categoryFilter);
    }

    setFilteredArticles(filtered);
  }, [articles, searchTerm, categoryFilter]);

  const getCategoryById = (id: string) => categories.find(c => c.id === id);

  const popularArticles = articles
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  const recentArticles = articles
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
            <div className="space-y-4">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Knowledge Base
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Find answers to common questions and learn how to use our platform
        </p>

        {/* Search */}
        <div className="max-w-2xl mx-auto">
          <Input
            placeholder="Search articles, guides, and FAQs..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            leftIcon={<Search className="h-5 w-5" />}
            className="text-lg py-3"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Filters */}
          <Card>
            <div className="flex items-center space-x-4">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} found
              </span>
            </div>
          </Card>

          {/* Articles List */}
          <div className="space-y-4">
            {filteredArticles.length > 0 ? (
              filteredArticles.map((article) => {
                const category = getCategoryById(article.categoryId);
                const helpfulPercentage = article.helpful + article.notHelpful > 0 
                  ? Math.round((article.helpful / (article.helpful + article.notHelpful)) * 100)
                  : 0;

                return (
                  <Card key={article.id} className="hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-2">
                          <Link
                            to={`/knowledge-base/${article.id}`}
                            className="text-xl font-semibold text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400"
                          >
                            {article.title}
                          </Link>
                          {category && (
                            <Badge variant="secondary" size="sm">
                              {category.name}
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">
                          {article.content.replace(/[#*]/g, '').substring(0, 200)}...
                        </p>
                        
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 mr-1" />
                            {article.views} views
                          </div>
                          <div className="flex items-center">
                            <ThumbsUp className="h-4 w-4 mr-1" />
                            {helpfulPercentage}% helpful
                          </div>
                          <div>
                            Updated {formatDate(article.updatedAt)}
                          </div>
                        </div>
                        
                        {article.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {article.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })
            ) : (
              <Card>
                <div className="text-center py-12">
                  <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No articles found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Try adjusting your search terms or browse by category
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Popular Articles */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Popular Articles
            </h3>
            <div className="space-y-3">
              {popularArticles.map((article, index) => (
                <Link
                  key={article.id}
                  to={`/knowledge-base/${article.id}`}
                  className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <div className="flex items-start space-x-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-orange-100 dark:bg-orange-900/20 text-orange-600 text-sm font-medium rounded-full flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                        {article.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {article.views} views
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Card>

          {/* Recent Articles */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recently Updated
            </h3>
            <div className="space-y-3">
              {recentArticles.map((article) => (
                <Link
                  key={article.id}
                  to={`/knowledge-base/${article.id}`}
                  className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 mb-1">
                    {article.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(article.updatedAt)}
                  </p>
                </Link>
              ))}
            </div>
          </Card>

          {/* Categories */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Browse by Category
            </h3>
            <div className="space-y-2">
              {categories.map((category) => {
                const articleCount = articles.filter(a => a.categoryId === category.id).length;
                return (
                  <button
                    key={category.id}
                    onClick={() => setCategoryFilter(category.id)}
                    className="w-full text-left p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {category.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {articleCount}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {category.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}