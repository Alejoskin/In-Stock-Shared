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
                items: category.items
                  ? Object.entries(category.items).map(([itemId, item]) => ({
                      id: itemId,
                      categoryName: category.name,
                      ...item,
                    }))
                  : [],
              })
            );

            setCategories(categoriesArray);

            // Combine all items from all categories and sort them
            const allItems = categoriesArray
              .reduce((acc, category) => [...acc, ...category.items], [])
              .sort((a, b) => a.name.localeCompare(b.name));

            setCurrentData(allItems);

            if (!showAllItems) {
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
  }, [navigate, showAllItems]);

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
    setShowAllItems(false);
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

  const handleUpdateAmount = async (itemId, categoryId, increment) => {
    const category = categories.find((cat) => cat.id === categoryId);
    const item = category.items.find((item) => item.id === itemId);
    if (!item) return;

    const newAmount = Math.max(0, item.amount + increment);
    const itemRef = ref(db, `categories/${categoryId}/items/${itemId}`);
    await update(itemRef, { amount: newAmount });
  };

  const showAllInventory = () => {
    setShowAllItems(true);
    const allItems = categories
      .reduce((acc, category) => [...acc, ...category.items], [])
      .sort((a, b) => a.name.localeCompare(b.name));
    setCurrentData(allItems);
    setCurrentCategoryId(null);
  };

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
        {showAllItems && (
          <button className="print-button" onClick={handlePrint}>
            Print Inventory
          </button>
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
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Description</th>
              <th>Type</th>
              <th>Amount</th>
              {showAllItems && <th>Category</th>}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((item) => (
              <tr key={`${item.id}`}>
                <td>{item.name}</td>
                <td>{item.description}</td>
                <td>{item.type}</td>
                <td>{item.amount}</td>
                {showAllItems && <td>{item.categoryName}</td>}
                <td>
                  <button
                    onClick={() =>
                      handleUpdateAmount(
                        item.id,
                        showAllItems
                          ? categories.find(
                              (cat) => cat.name === item.categoryName
                            ).id
                          : currentCategoryId,
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
                        showAllItems
                          ? categories.find(
                              (cat) => cat.name === item.categoryName
                            ).id
                          : currentCategoryId,
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