import { useEffect, useState, useRef } from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { ref, onValue, push, set, update, remove } from 'firebase/database';
import auth, { db } from '../firebase-config';

function App() {
  // State for managing current data and categories
  const [currentData, setCurrentData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // State for managing forms and inputs
  const [newCategoryForm, setNewCategoryForm] = useState({
    name: '',
  });
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    type: '',
    amount: 0,
  });
  
  // State for managing editing and item selection
  const [editingItem, setEditingItem] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [currentCategoryId, setCurrentCategoryId] = useState(null);
  const currentCategoryIdRef = useRef(null);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [showAllItems, setShowAllItems] = useState(true);
  
  // State for managing delete confirmations
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showCategoryDeleteConfirm, setShowCategoryDeleteConfirm] = useState(false);
  
  const navigate = useNavigate();

  // Effect for handling authentication and data fetching
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      if (!user) {
        navigate('/login');
      } else {
        // Set up real-time database listener
        const categoriesRef = ref(db, 'categories');
        onValue(categoriesRef, (snapshot) => {
          const data = snapshot.val();
          if (data) {
            // Transform the data and add category information to items
            const categoriesArray = Object.entries(data).map(
              ([id, category]) => ({
                id,
                ...category,
                items: category.items
                  ? Object.entries(category.items).map(([itemId, item]) => ({
                      id: itemId,
                      categoryId: id,
                      categoryName: category.name,
                      ...item,
                    }))
                  : [],
              })
            );

            setCategories(categoriesArray);

            if (showAllItems) {
              // Combine and sort all items alphabetically
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
          } else {
            setCategories([]);
            setCurrentData([]);
          }
        });
      }
    });

    return () => unsubscribe();
  }, [navigate, showAllItems]);

  // UI toggle functions
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  // Authentication functions
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error.message);
    }
  };

  // Category management functions
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

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setNewCategoryForm({ name: category.name });
  };

  const handleUpdateCategory = async () => {
    if (editingCategory && newCategoryForm.name.trim()) {
      const categoryRef = ref(db, `categories/${editingCategory.id}`);
      await update(categoryRef, { name: newCategoryForm.name });
      setEditingCategory(null);
      setNewCategoryForm({ name: '' });
    }
  };

  const selectCategory = (category) => {
    setCurrentCategoryId(category.id);
    currentCategoryIdRef.current = category.id;
    setShowAllItems(false);
    setCurrentData(category.items || []);
  };

  // Item management functions
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

  // Delete confirmation handlers
  const confirmDeleteItem = (item) => {
    setItemToDelete(item);
    setShowDeleteConfirm(true);
  };

  const handleDeleteItem = async () => {
    if (itemToDelete) {
      const itemRef = ref(
        db,
        `categories/${itemToDelete.categoryId}/items/${itemToDelete.id}`
      );
      await remove(itemRef);
      setShowDeleteConfirm(false);
      setItemToDelete(null);
    }
  };

  const confirmDeleteCategory = () => {
    setShowCategoryDeleteConfirm(true);
  };

  const handleDeleteCategory = async () => {
    if (currentCategoryId) {
      const categoryRef = ref(db, `categories/${currentCategoryId}`);
      await remove(categoryRef);
      setCurrentCategoryId(null);
      currentCategoryIdRef.current = null;
      setShowAllItems(true);
      setShowCategoryDeleteConfirm(false);
    }
  };

  // Item editing functions
  const handleEditItem = (item) => {
    setEditingItem(item);
    setNewItem({
      name: item.name,
      description: item.description,
      type: item.type,
      amount: item.amount,
    });
  };

  const handleUpdateItem = async () => {
    if (editingItem && newItem.name && newItem.description && newItem.type) {
      const itemRef = ref(
        db,
        `categories/${editingItem.categoryId}/items/${editingItem.id}`
      );
      await update(itemRef, newItem);
      setEditingItem(null);
      setNewItem({ name: '', description: '', type: '', amount: 0 });
    }
  };

  // View management functions
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
      {/* Delete confirmation dialogs */}
      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete {itemToDelete?.name}?</p>
            <div className="modal-actions">
              <button onClick={handleDeleteItem}>Yes, Delete</button>
              <button onClick={() => {
                setShowDeleteConfirm(false);
                setItemToDelete(null);
              }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showCategoryDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirm Category Delete</h3>
            <p>Are you sure you want to delete this category and all its items?</p>
            <div className="modal-actions">
              <button onClick={handleDeleteCategory}>Yes, Delete</button>
              <button onClick={() => setShowCategoryDeleteConfirm(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main header */}
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

      {/* Sidebar menu */}
      <div className={`left-menu ${sidebarVisible ? '' : 'hidden'}`}>
        <div className="dropdown">
          <button className="category" onClick={showAllInventory}>
            All Items
          </button>
        </div>
        {categories.map((category) => (
          <div className="dropdown" key={category.id}>
            {editingCategory?.id === category.id ? (
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
                <button onClick={handleUpdateCategory}>Save</button>
                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setNewCategoryForm({ name: '' });
                  }}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="category-container">
                <button
                  className="category"
                  onClick={() => selectCategory(category)}
                >
                  {category.name}
                </button>
                <button
                  className="edit-category"
                  onClick={() => handleEditCategory(category)}
                >
                  Edit
                </button>
              </div>
            )}
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

      {/* Main content area */}
      <div className={`table-area ${sidebarVisible ? '' : 'full-width'}`}>
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
          {editingItem ? (
            <button onClick={handleUpdateItem}>Update Item</button>
          ) : (
            <button onClick={handleAddItem}>Add Item</button>
          )}

          {currentCategoryId && (
            <button onClick={confirmDeleteCategory} className="delete-all-button">
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
              {showAllItems && <th>Category</th>}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((item) => (
              <tr key={`${item.categoryId}-${item.id}`}>
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
                  <button onClick={() => handleEditItem(item)}>Edit</button>
                  <button onClick={() => confirmDeleteItem(item)}>
                    Delete
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