import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, BookOpen, Zap, Users, Trophy } from 'lucide-react';

function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'student'
  });
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login({
          email: formData.email,
          password: formData.password
        });
      } else {
        await register(formData);
        setIsLogin(true);
        setFormData({ ...formData, password: '' });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="flex">
        {/* Left Side - Hero Section */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-purple-700 items-center justify-center p-12">
          <div className="text-white text-center max-w-md">
            <div className="mb-8">
              <BookOpen className="w-20 h-20 mx-auto mb-6 text-blue-200" />
              <h1 className="text-4xl font-bold mb-4">Hızlı Okuma Platformu</h1>
              <p className="text-blue-100 text-lg">
                Okuma hızınızı artırın, anlama yetinizi geliştirin ve başarıya ulaşın!
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <Zap className="w-8 h-8 text-yellow-300" />
                <div className="text-left">
                  <h3 className="font-semibold">Hızlı Öğrenme</h3>
                  <p className="text-blue-100 text-sm">RSVP teknikleri ile okuma hızınızı artırın</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Users className="w-8 h-8 text-green-300" />
                <div className="text-left">
                  <h3 className="font-semibold">Öğretmen Desteği</h3>
                  <p className="text-blue-100 text-sm">Uzman öğretmenlerden rehberlik alın</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <Trophy className="w-8 h-8 text-orange-300" />
                <div className="text-left">
                  <h3 className="font-semibold">Başarı Takibi</h3>
                  <p className="text-blue-100 text-sm">İlerlemenizi izleyin ve rozetler kazanın</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="text-center mb-8">
                <BookOpen className="w-12 h-12 mx-auto text-blue-600 mb-4" />
                <h2 className="text-3xl font-bold text-gray-800">
                  {isLogin ? 'Giriş Yap' : 'Kayıt Ol'}
                </h2>
                <p className="text-gray-600 mt-2">
                  {isLogin ? 'Hesabınıza giriş yapın' : 'Yeni hesap oluşturun'}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {!isLogin && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ad
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Adınız"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Soyad
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Soyadınız"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kullanıcı Adı
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        placeholder="Kullanıcı adınız"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rol
                      </label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="student">Öğrenci</option>
                        <option value="teacher">Öğretmen</option>
                      </select>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    E-posta
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="ornek@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Şifre
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Lütfen bekleyin...' : (isLogin ? 'Giriş Yap' : 'Kayıt Ol')}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  {isLogin ? 'Hesabınız yok mu?' : 'Zaten hesabınız var mı?'}
                  <button
                    onClick={() => setIsLogin(!isLogin)}
                    className="ml-2 text-blue-600 hover:text-blue-700 font-medium"
                  >
                    {isLogin ? 'Kayıt ol' : 'Giriş yap'}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;