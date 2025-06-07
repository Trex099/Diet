import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Camera, Plus, X, Droplets, Calendar, Book, Coffee, Sun, Moon, Utensils, Maximize2, Eye, Trash2, Settings } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import './App.css';

// Data Models & Local Storage
const loadFromStorage = (key, defaultValue = []) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const saveToStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Food Entry Component
const FoodEntryCard = ({ entry, onClick, onDelete }) => {
  const [showImageModal, setShowImageModal] = useState(false);

  const handleDelete = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this meal?')) {
      onDelete(entry.id);
      toast.success('Meal deleted successfully');
    }
  };

  return (
    <>
      <div 
        className="food-card bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-400 cursor-pointer transform hover:scale-[1.02] relative"
        onClick={() => onClick(entry)}
      >
        {entry.image ? (
          <div className="relative h-48 overflow-hidden">
            <img 
              src={entry.image} 
              alt={entry.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <h3 className="font-bold text-lg">{entry.name}</h3>
              <p className="text-sm opacity-90">{entry.mealType} • {entry.time}</p>
              {(entry.calories || entry.protein || entry.carbs || entry.fat) && (
                <div className="text-xs opacity-75 mt-1">
                  {entry.calories && `${entry.calories} cal`}
                  {entry.protein && ` • ${entry.protein}g protein`}
                  {entry.carbs && ` • ${entry.carbs}g carbs`}
                  {entry.fat && ` • ${entry.fat}g fat`}
                </div>
              )}
            </div>
            
            {/* Delete Button */}
            <button
              onClick={handleDelete}
              className="absolute top-4 right-4 bg-red-500/80 backdrop-blur-sm text-white p-2 rounded-full hover:bg-red-600/90 transition-colors z-10"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            
            {/* Maximize Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowImageModal(true);
              }}
              className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="p-6 relative">
            {/* Delete Button for non-image cards */}
            <button
              onClick={handleDelete}
              className="absolute top-3 right-3 bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200 transition-colors z-10"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            
            <h3 className="font-bold text-gray-800 text-lg pr-12">{entry.name}</h3>
            <p className="text-gray-600 text-sm">{entry.mealType} • {entry.time}</p>
            {(entry.calories || entry.protein || entry.carbs || entry.fat) && (
              <div className="text-gray-500 text-xs mt-1">
                {entry.calories && `${entry.calories} cal`}
                {entry.protein && ` • ${entry.protein}g protein`}
                {entry.carbs && ` • ${entry.carbs}g carbs`}
                {entry.fat && ` • ${entry.fat}g fat`}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image Modal */}
      {showImageModal && entry.image && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-full max-h-full">
            <img 
              src={entry.image} 
              alt={entry.name}
              className="max-w-full max-h-full object-contain rounded-xl"
            />
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white p-3 rounded-xl">
              <h3 className="font-bold text-lg">{entry.name}</h3>
              <p className="text-sm opacity-90">{entry.mealType} • {entry.time}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Water Tracker Component
const WaterTracker = ({ dailyGoal = 8, currentIntake, onAddWater, onEditWater }) => {
  const percentage = Math.min((currentIntake / dailyGoal) * 100, 100);
  
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800">Water Intake</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">{currentIntake}/{dailyGoal} glasses</span>
          <button
            onClick={onEditWater}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Settings className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
      
      <div 
        className="relative h-12 bg-gray-100 rounded-full overflow-hidden cursor-pointer hover:bg-gray-200 transition-colors"
        onClick={onAddWater}
      >
        <div 
          className="h-full bg-gradient-to-r from-blue-300 to-blue-500 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <Droplets className="w-5 h-5 text-blue-600" />
        </div>
      </div>
    </div>
  );
};

// Add Food Modal
const AddFoodModal = ({ isOpen, onClose, onAddFood, isPantry = false }) => {
  const [name, setName] = useState('');
  const [mealType, setMealType] = useState('breakfast');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleImageCapture = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsLoading(true);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const entry = {
      id: uuidv4(),
      name: name.trim(),
      mealType: isPantry ? 'meal' : mealType,
      calories: calories ? parseInt(calories) : null,
      protein: protein ? parseInt(protein) : null,
      carbs: carbs ? parseInt(carbs) : null,
      fat: fat ? parseInt(fat) : null,
      image,
      time: isPantry ? null : format(new Date(), 'HH:mm'),
      date: isPantry ? null : format(new Date(), 'yyyy-MM-dd'),
      timestamp: new Date().toISOString(),
      isPantryItem: isPantry
    };

    onAddFood(entry);
    setName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    setImage(null);
    toast.success(isPantry ? 'Food added to pantry!' : 'Food logged successfully!');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50 p-4">
      <div className="bg-white rounded-t-3xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              {isPantry ? 'Add to Pantry' : 'Add Food'}
            </h2>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Capture */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photo (Optional)
              </label>
              {image ? (
                <div className="relative">
                  <img src={image} alt="Food" className="w-full h-48 object-cover rounded-xl" />
                  <button
                    type="button"
                    onClick={() => setImage(null)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="block w-full h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 transition-colors">
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    {isLoading ? (
                      <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
                    ) : (
                      <>
                        <Camera className="w-8 h-8 mb-2" />
                        <span className="text-sm">Tap to add photo</span>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageCapture}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Meal Type (only for daily log, not pantry) */}
            {!isPantry && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meal Type
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: 'breakfast', icon: Coffee, label: 'Breakfast' },
                    { value: 'lunch', icon: Sun, label: 'Lunch' },
                    { value: 'dinner', icon: Moon, label: 'Dinner' },
                    { value: 'snack', icon: Utensils, label: 'Snack' }
                  ].map(({ value, icon: Icon, label }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setMealType(value)}
                      className={`p-3 rounded-xl flex flex-col items-center gap-1 transition-all ${
                        mealType === value
                          ? 'bg-pink-100 text-pink-600 border-2 border-pink-300'
                          : 'bg-gray-50 text-gray-600 border-2 border-transparent hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-medium">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Food Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Food Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={isPantry ? "What food are you adding?" : "What did you eat?"}
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                required
              />
            </div>

            {/* Macros */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nutrition (Optional)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  placeholder="Calories"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                />
                <input
                  type="number"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  placeholder="Protein (g)"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                />
                <input
                  type="number"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  placeholder="Carbs (g)"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                />
                <input
                  type="number"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                  placeholder="Fat (g)"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-pink-500 text-white py-3 rounded-xl font-medium hover:bg-pink-600 transition-colors"
            >
              {isPantry ? 'Add to Pantry' : 'Log Food'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Water Edit Modal
const WaterEditModal = ({ isOpen, onClose, currentIntake, dailyGoal, onUpdate }) => {
  const [intake, setIntake] = useState(currentIntake);
  const [goal, setGoal] = useState(dailyGoal);

  useEffect(() => {
    setIntake(currentIntake);
    setGoal(dailyGoal);
  }, [currentIntake, dailyGoal]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(parseInt(intake), parseInt(goal));
    toast.success('Water settings updated!');
    onClose();
  };

  const handleReset = () => {
    setIntake(0);
    onUpdate(0, goal);
    toast.success('Water intake reset for today!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Water Settings</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Intake */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Intake (glasses)
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIntake(Math.max(0, intake - 1))}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                -
              </button>
              <input
                type="number"
                value={intake}
                onChange={(e) => setIntake(Math.max(0, parseInt(e.target.value) || 0))}
                className="flex-1 p-3 border border-gray-300 rounded-xl text-center focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                min="0"
              />
              <button
                type="button"
                onClick={() => setIntake(intake + 1)}
                className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Daily Goal */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Daily Goal (glasses)
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setGoal(Math.max(1, goal - 1))}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
              >
                -
              </button>
              <input
                type="number"
                value={goal}
                onChange={(e) => setGoal(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 p-3 border border-gray-300 rounded-xl text-center focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                min="1"
              />
              <button
                type="button"
                onClick={() => setGoal(goal + 1)}
                className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center hover:bg-blue-200 transition-colors"
              >
                +
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Reset Today
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-medium hover:bg-blue-600 transition-colors"
            >
              Update
            </button>
          </div>
        </form>

        {/* Quick Goal Presets */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-3">Quick goal presets:</p>
          <div className="flex gap-2">
            {[6, 8, 10, 12].map(preset => (
              <button
                key={preset}
                type="button"
                onClick={() => setGoal(preset)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  goal === preset
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
const FoodDetailModal = ({ entry, isOpen, onClose }) => {
  if (!isOpen || !entry) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto">
        <div className="relative">
          {entry.image && (
            <div className="h-64 overflow-hidden rounded-t-2xl">
              <img 
                src={entry.image} 
                alt={entry.name}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{entry.name}</h2>
          <p className="text-gray-600 mb-4">
            {entry.mealType} {entry.time && `• ${entry.time}`}
          </p>
          
          {(entry.calories || entry.protein || entry.carbs || entry.fat) && (
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-800 mb-3">Nutrition Information</h3>
              <div className="grid grid-cols-2 gap-3">
                {entry.calories && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{entry.calories}</p>
                    <p className="text-sm text-gray-600">Calories</p>
                  </div>
                )}
                {entry.protein && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{entry.protein}g</p>
                    <p className="text-sm text-gray-600">Protein</p>
                  </div>
                )}
                {entry.carbs && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{entry.carbs}g</p>
                    <p className="text-sm text-gray-600">Carbs</p>
                  </div>
                )}
                {entry.fat && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">{entry.fat}g</p>
                    <p className="text-sm text-gray-600">Fat</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
// Today Screen
const TodayScreen = () => {
  const [foodEntries, setFoodEntries] = useState(() => loadFromStorage('foodEntries', []));
  const [waterIntake, setWaterIntake] = useState(() => loadFromStorage('waterIntake', 0));
  const [waterGoal, setWaterGoal] = useState(() => loadFromStorage('waterGoal', 8));
  const [showAddFood, setShowAddFood] = useState(false);
  const [showWaterEdit, setShowWaterEdit] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const navigate = useNavigate();

  const todayEntries = foodEntries.filter(entry => 
    entry.date === format(new Date(), 'yyyy-MM-dd') && !entry.isPantryItem
  );

  const addFood = (entry) => {
    const newEntries = [entry, ...foodEntries];
    setFoodEntries(newEntries);
    saveToStorage('foodEntries', newEntries);
  };

  const deleteFood = (entryId) => {
    const newEntries = foodEntries.filter(entry => entry.id !== entryId);
    setFoodEntries(newEntries);
    saveToStorage('foodEntries', newEntries);
  };

  const addWater = () => {
    const newIntake = waterIntake + 1;
    setWaterIntake(newIntake);
    saveToStorage('waterIntake', newIntake);
    toast.success('Water logged! 💧');
  };

  const updateWater = (newIntake, newGoal) => {
    setWaterIntake(newIntake);
    setWaterGoal(newGoal);
    saveToStorage('waterIntake', newIntake);
    saveToStorage('waterGoal', newGoal);
  };

  const handleCardClick = (entry) => {
    setSelectedEntry(entry);
    setShowDetailModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Today</h1>
              <p className="text-gray-600">{format(new Date(), 'EEEE, MMMM d')}</p>
            </div>
            <button 
              onClick={() => navigate('/pantry')}
              className="p-3 bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200 transition-colors"
            >
              <Book className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6 space-y-6">
        {/* Water Tracker */}
        <WaterTracker 
          currentIntake={waterIntake}
          dailyGoal={waterGoal}
          onAddWater={addWater}
          onEditWater={() => setShowWaterEdit(true)}
        />

        {/* Food Entries */}
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Today's Meals</h2>
          {todayEntries.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center">
              <Utensils className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No meals logged yet</p>
              <p className="text-gray-400 text-sm mt-1">Tap the + button to add your first meal</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayEntries.map(entry => (
                <FoodEntryCard 
                  key={entry.id} 
                  entry={entry}
                  onClick={handleCardClick}
                  onDelete={deleteFood}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Food Modal */}
      <AddFoodModal 
        isOpen={showAddFood}
        onClose={() => setShowAddFood(false)}
        onAddFood={addFood}
      />

      {/* Water Edit Modal */}
      <WaterEditModal
        isOpen={showWaterEdit}
        onClose={() => setShowWaterEdit(false)}
        currentIntake={waterIntake}
        dailyGoal={waterGoal}
        onUpdate={updateWater}
      />

      {/* Food Detail Modal */}
      <FoodDetailModal
        entry={selectedEntry}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />

      {/* FAB */}
      <button
        onClick={() => setShowAddFood(true)}
        className="fixed bottom-24 left-1/2 transform -translate-x-1/2 bg-pink-500 text-white p-4 rounded-full shadow-lg hover:bg-pink-600 hover:scale-110 transition-all duration-300 z-10"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};

// History Screen
const HistoryScreen = () => {
  const [foodEntries, setFoodEntries] = useState(() => loadFromStorage('foodEntries', []));
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Group entries by date (exclude pantry items)
  const entriesByDate = foodEntries
    .filter(entry => !entry.isPantryItem)
    .reduce((acc, entry) => {
      if (!acc[entry.date]) {
        acc[entry.date] = [];
      }
      acc[entry.date].push(entry);
      return acc;
    }, {});

  const dates = Object.keys(entriesByDate).sort().reverse();

  const deleteFood = (entryId) => {
    const newEntries = foodEntries.filter(entry => entry.id !== entryId);
    setFoodEntries(newEntries);
    saveToStorage('foodEntries', newEntries);
    toast.success('Meal deleted successfully');
  };

  const handleEntryClick = (entry) => {
    setSelectedEntry(entry);
    setShowDetailModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-800">History</h1>
          <p className="text-gray-600">Your food journey</p>
        </div>
      </div>

      <div className="px-4 py-6 space-y-6">
        {dates.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No history yet</p>
            <p className="text-gray-400 text-sm mt-1">Start logging meals to see your journey</p>
          </div>
        ) : (
          dates.map(date => (
            <div key={date} className="bg-white rounded-2xl p-4">
              <h3 className="font-semibold text-gray-800 mb-3">
                {format(new Date(date), 'EEEE, MMMM d, yyyy')}
              </h3>
              <div className="space-y-2">
                {entriesByDate[date].map(entry => (
                  <div 
                    key={entry.id} 
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg relative group"
                  >
                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('Are you sure you want to delete this meal?')) {
                          deleteFood(entry.id);
                        }
                      }}
                      className="absolute top-2 right-2 bg-red-100 text-red-600 p-1 rounded-full hover:bg-red-200 transition-colors opacity-0 group-hover:opacity-100 z-10"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                    
                    {/* Clickable Content */}
                    <div 
                      className="flex items-center gap-3 flex-1 cursor-pointer hover:bg-gray-100 rounded-lg p-1 transition-colors"
                      onClick={() => handleEntryClick(entry)}
                    >
                      {entry.image && (
                        <img src={entry.image} alt={entry.name} className="w-12 h-12 object-cover rounded-lg" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{entry.name}</p>
                        <p className="text-sm text-gray-600">{entry.mealType} • {entry.time}</p>
                      </div>
                      <div className="text-right pr-8">
                        {entry.calories && (
                          <span className="text-sm text-gray-500">{entry.calories} cal</span>
                        )}
                        <Eye className="w-4 h-4 text-gray-400 mt-1 mx-auto" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Food Detail Modal */}
      <FoodDetailModal
        entry={selectedEntry}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />
    </div>
  );
};

// Pantry Card Component
const PantryCard = ({ item, onClick }) => {
  return (
    <div 
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-400 cursor-pointer transform hover:scale-[1.02]"
      onClick={() => onClick(item)}
    >
      {item.image ? (
        <div className="relative h-32 overflow-hidden">
          <img 
            src={item.image} 
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute bottom-2 left-2 text-white">
            <h3 className="font-bold text-sm">{item.name}</h3>
          </div>
        </div>
      ) : (
        <div className="h-32 bg-gray-100 flex items-center justify-center">
          <Utensils className="w-8 h-8 text-gray-400" />
        </div>
      )}
      <div className="p-3">
        {!item.image && <h3 className="font-bold text-gray-800 text-sm mb-1">{item.name}</h3>}
        {(item.calories || item.protein || item.carbs || item.fat) && (
          <div className="text-xs text-gray-500">
            {item.calories && `${item.calories} cal`}
            {item.protein && ` • ${item.protein}g protein`}
          </div>
        )}
      </div>
    </div>
  );
};

// Pantry Screen
const PantryScreen = () => {
  const [pantryItems, setPantryItems] = useState(() => 
    loadFromStorage('foodEntries', []).filter(item => item.isPantryItem)
  );
  const [showAddToPantry, setShowAddToPantry] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const addToPantry = (item) => {
    const allEntries = loadFromStorage('foodEntries', []);
    const newEntries = [item, ...allEntries];
    saveToStorage('foodEntries', newEntries);
    setPantryItems([item, ...pantryItems]);
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Pantry</h1>
              <p className="text-gray-600">Your saved foods</p>
            </div>
            <button
              onClick={() => setShowAddToPantry(true)}
              className="bg-pink-500 text-white p-3 rounded-xl hover:bg-pink-600 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {pantryItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center">
            <Book className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">Your pantry is empty</p>
            <p className="text-gray-400 text-sm mt-1">Add foods you eat frequently for quick logging</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {pantryItems.map(item => (
              <PantryCard 
                key={item.id} 
                item={item}
                onClick={handleItemClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add to Pantry Modal */}
      <AddFoodModal 
        isOpen={showAddToPantry}
        onClose={() => setShowAddToPantry(false)}
        onAddFood={addToPantry}
        isPantry={true}
      />

      {/* Food Detail Modal */}
      <FoodDetailModal
        entry={selectedItem}
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
      />
    </div>
  );
};

// Bottom Navigation
const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { path: '/', icon: Sun, label: 'Today' },
    { path: '/history', icon: Calendar, label: 'History' }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex">
        {navItems.map(({ path, icon: Icon, label }) => (
          <button
            key={path}
            onClick={() => navigate(path)}
            className={`flex-1 flex flex-col items-center py-3 transition-colors ${
              location.pathname === path
                ? 'text-blue-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <Icon className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Main App
function App() {
  return (
    <Router>
      <div className="App font-sans">
        <Routes>
          <Route path="/" element={<TodayScreen />} />
          <Route path="/history" element={<HistoryScreen />} />
          <Route path="/pantry" element={<PantryScreen />} />
        </Routes>
        <BottomNav />
        <Toaster 
          position="top-center"
          toastOptions={{
            duration: 2000,
            style: {
              background: '#fff',
              color: '#374151',
              borderRadius: '12px',
              padding: '12px 16px',
              fontSize: '14px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
            }
          }}
        />
      </div>
    </Router>
  );
}

export default App;