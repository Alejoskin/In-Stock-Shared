import { useEffect, useState, useRef } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { ref, onValue, push, set, update } from 'firebase/database';
import auth, { db } from '../firebase-config';

function App() {
  const [currentData, setCurrentData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [newCategoryForm, setNewCategoryForm] = useState({
    name: '',
  });
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    type: '',
    amount: 0,
  });
  const [currentCategoryId, setCurrentCategoryId] = useState(null);
  const currentCategoryIdRef = useRef(null);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  // Added state to track if we're showing all items
  const [showAllItems, setShowAllItems] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      if (!user) {
        navigate('/login');
      } else {
        const categoriesRef = ref(db, 'categories');
        onValue(categoriesRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            const categoriesArray = Object.entries(data).map(
              ([id, category]) => ({
                id,
                ...category,
                // Added categoryId and categoryName to each item for unique identification
                items: category.items
                  ? Object.entries(category.items).map(([itemId, item]) => ({
                      id: itemId,
                      categoryId: id,  // Store category ID with each item
                      categoryName: category.name, // Store category name for display
                      ...item,
                    }))
                  : [],
              })
            );

            setCategories(categoriesArray);

            // If showing all items, combine and sort them alphabetically
            if (showAllItems) {
              const allItems = categoriesArray
                .reduce((acc, category) => [...acc, ...category.items], [])
                .sort((a, b) => a.name.localeCompare(b.name));
              setCurrentData(allItems);
            } else {
              // Show items from selected category
              const selected = categoriesArray.find(
                (cat) => cat.id === currentCategoryIdRef.current
              );
              if (selected) {
                setCurrentData(selected.items || []);
              } else if (categoriesArray.length > 0) {
                const defaultCategory = categoriesArray[0];
                setCurrentCategoryId(defaultCategory.id);
                currentCategoryIdRef.current = defaultCategory.id;
                setCurrentData(defaultCategory.items || []);
              }
            }
          }
        });
      }
    });

    return () => unsubscribe();
  }, [navigate, showAllItems]); // Added showAllItems to dependencies

  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error.message);
    }
  };

  const handleAddCategory = async () => {
    if (newCategoryForm.name.trim()) {
      const categoriesRef = ref(db, 'categories');
      const newCategoryRef = push(categoriesRef);
      await set(newCategoryRef, {
        name: newCategoryForm.name,
        items: [],
      });
      setNewCategoryForm({
        name: '',
      });
      setShowNewCategoryInput(false);
    }
  };

  const selectCategory = (category) => {
    setCurrentCategoryId(category.id);
    currentCategoryIdRef.current = category.id;
    setShowAllItems(false); // Disable all items view when selecting a category
    setCurrentData(category.items || []);
  };

  const handleAddItem = async () => {
    if (
      currentCategoryId &&
      newItem.name &&
      newItem.description &&
      newItem.type
    ) {
      const categoryRef = ref(db, `categories/${currentCategoryId}/items`);
      const newItemRef = push(categoryRef);
      await set(newItemRef, newItem);
      setNewItem({ name: '', description: '', type: '', amount: 0 });
    }
  };

  // Updated to use categoryId parameter for handling updates in all items view
  const handleUpdateAmount = async (itemId, categoryId, increment) => {
    const category = categories.find((cat) => cat.id === categoryId);
    const item = category.items.find((item) => item.id === itemId);
    if (!item) return;

    const newAmount = Math.max(0, item.amount + increment);
    const itemRef = ref(db, `categories/${categoryId}/items/${itemId}`);
    await update(itemRef, { amount: newAmount });
  };

  const handleDeleteItem = async (itemId) => {
    const itemRef = ref(db, `categories/${currentCategoryId}/items/${itemId}`);
    await remove(itemRef);
  };

  const handleDeleteCategory = async () => {
    if (currentCategoryId) {
      const categoryRef = ref(db, `categories/${currentCategoryId}`);
      await remove(categoryRef);
      
      // Reset current category and data
      if (categories.length > 1) {
        const newCurrentCategory = categories.find(cat => cat.id !== currentCategoryId);
        setCurrentCategoryId(newCurrentCategory.id);
        currentCategoryIdRef.current = newCurrentCategory.id;
        setCurrentData(newCurrentCategory.items || []);
      } else {
        setCurrentCategoryId(null);
        currentCategoryIdRef.current = null;
        setCurrentData([]);
      }
    }
  };

  // New function to show all inventory items
  const showAllInventory = () => {
    setShowAllItems(true);
    const allItems = categories
      .reduce((acc, category) => [...acc, ...category.items], [])
      .sort((a, b) => a.name.localeCompare(b.name));
    setCurrentData(allItems);
    setCurrentCategoryId(null);
  };

  // New function to handle printing
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <div className="header">
        <button className="settings-button" onClick={toggleSidebar}>
          Settings
        </button>
        <a href="#" className="logo">
          In Stock
        </a>
        <div className="login">
          <button className="login-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
      <div className={`left-menu ${sidebarVisible ? '' : 'hidden'}`}>
        {/* Added "All Items" button at the top */}
        <div className="dropdown">
          <button className="category" onClick={showAllInventory}>
            All Items
          </button>
        </div>
        {categories.map((category) => (
          <div className="dropdown" key={category.id}>
            <button
              className="category"
              onClick={() => selectCategory(category)}
            >
              {category.name}
            </button>
          </div>
        ))}
        <div className="dropdown">
          {showNewCategoryInput ? (
            <div className="new-category-input">
              <input
                type="text"
                value={newCategoryForm.name}
                onChange={(e) =>
                  setNewCategoryForm({
                    ...newCategoryForm,
                    name: e.target.value,
                  })
                }
                placeholder="Category name"
              />
              <button onClick={handleAddCategory}>Add Category</button>
              <button
                onClick={() => {
                  setShowNewCategoryInput(false);
                  setNewCategoryForm({
                    name: '',
                  });
                }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              className="new-category"
              onClick={() => setShowNewCategoryInput(true)}
            >
              New Category
            </button>
          )}
        </div>
      </div>

      <div className={`table-area ${sidebarVisible ? '' : 'full-width'}`}>
        {/* Added print button when showing all items, yes  */}
        {showAllItems && (
          <>
          <button className="print-button" onClick={handlePrint}>
            Print Inventory
          </button>
          <h1 className="print-header">Inventory Overview</h1>
          </>
        )}
        <div className="new-item-form">
          <input
            type="text"
            value={newItem.name}
            onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            placeholder="Item name"
          />
          <input
            type="text"
            value={newItem.description}
            onChange={(e) =>
              setNewItem({ ...newItem, description: e.target.value })
            }
            placeholder="Description"
          />
          <input
            type="text"
            value={newItem.type}
            onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
            placeholder="Type"
          />
          <input
            type="number"
            value={newItem.amount}
            onChange={(e) =>
              setNewItem({ ...newItem, amount: parseInt(e.target.value) || 0 })
            }
            placeholder="Amount"
          />
          <button onClick={handleAddItem}>Add Item</button>

          {currentCategoryId && (
            <button onClick={handleDeleteCategory} className="delete-all-button">
              Delete Category
            </button>
          )}
          
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Type</th>
              <th>Amount</th>
              {/* Added category column when showing all items */}
              {showAllItems && <th>Category</th>}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((item) => (
              // Updated key to use both categoryId and item.id for uniqueness
              <tr key={`${item.categoryId}-${item.id}`}>
                <td>{item.name}</td>
                <td>{item.description}</td>
                <td>{item.type}</td>
                <td>{item.amount}</td>
                {/* Show category name when in all items view */}
                {showAllItems && <td>{item.categoryName}</td>}
                <td>
                  <button
                    onClick={() =>
                      handleUpdateAmount(
                        item.id,
                        showAllItems ? item.categoryId : currentCategoryId,
                        1
                      )
                    }
                  >
                    +
                  </button>
                  <button
                    onClick={() =>
                      handleUpdateAmount(
                        item.id,
                        showAllItems ? item.categoryId : currentCategoryId,
                        -1
                      )
                    }
                  >
                    -
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default App;