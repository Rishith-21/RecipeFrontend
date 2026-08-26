import React, { useState, useEffect } from "react";
import { FaPlus, FaMinus } from "react-icons/fa";
import "./my_recipes.css";

function AddRecipeForm() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [region, setRegion] = useState("");
  const [ingredients, setIngredients] = useState([""]);
  const [steps, setSteps] = useState([""]);
  const [image, setImage] = useState(null);
  const [addProducts, setAddProducts] = useState(false);
  const [products, setProducts] = useState([{ name: "", description: "", price: "", image: null }]);
  const [submittedRecipeId, setSubmittedRecipeId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [userRecipes, setUserRecipes] = useState([]);
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  useEffect(() => {
    async function fetchUserRecipes() {
      setLoadingRecipes(true);
      try {
        const response = await fetch("http://localhost:5000/api/user-recipes/my-recipes", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        if (!response.ok) throw new Error("Failed to load recipes");
        const data = await response.json();
        setUserRecipes(data.recipes || []);
      } catch {
        setUserRecipes([]);
      } finally {
        setLoadingRecipes(false);
      }
    }
    fetchUserRecipes();
  }, []);

  // -- Step handlers remain the same as your original code
  const handleStepChange = (index, value) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
  };
  const handleAddStep = () => setSteps([...steps, ""]);
  const handleRemoveStep = (index) => setSteps(steps.filter((_, i) => i !== index));

  const handleProductChange = (index, field, value) => {
    const newProducts = [...products];
    newProducts[index][field] = value;
    setProducts(newProducts);
  };
  const handleProductImageChange = (index, file) => {
    const newProducts = [...products];
    newProducts[index].image = file;
    setProducts(newProducts);
  };
  const handleAddProduct = () => setProducts([...products, { name: "", description: "", price: "", image: null }]);
  const handleRemoveProduct = (index) => setProducts(products.filter((_, i) => i !== index));
  const handleRecipeImageChange = (e) => {
    if (e.target.files.length) setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSubmittedRecipeId(null);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("category", category);
      formData.append("region", region);

      // Append ingredients as "ingredients[]"
      ingredients.filter(Boolean).forEach((ing) => formData.append("ingredients[]", ing));

      // Append steps as "steps[]"
      steps.filter(Boolean).forEach((step) => formData.append("steps[]", step));

      if (image) formData.append("image", image);
      formData.append("addProducts", addProducts);
      if (addProducts) {
        products.forEach((prod, i) => {
          formData.append(`products[${i}][name]`, prod.name);
          formData.append(`products[${i}][description]`, prod.description);
          formData.append(`products[${i}][price]`, prod.price);
          if (prod.image) formData.append(`products[${i}][image]`, prod.image);
        });
      }
      const isEditing = editingRecipe !== null;
      const url = isEditing 
        ? `http://localhost:5000/api/user-recipes/${editingRecipe._id}`
        : "http://localhost:5000/api/user-recipes/add";
      
      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        body: formData,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.msg || `Failed to ${isEditing ? 'update' : 'add'} recipe`);
      }
      
      const data = await response.json();
      setSubmittedRecipeId(data._id || data.recipeId || null);
      
      if (isEditing) {
        setUserRecipes(prev => prev.map(recipe => 
          recipe._id === editingRecipe._id ? data : recipe
        ));
      } else {
        setUserRecipes(prev => [...prev, data]);
      }
      
      setTitle("");
      setDescription("");
      setCategory("");
      setRegion("");
      setIngredients([""]);
      setSteps([""]);
      setImage(null);
      setAddProducts(false);
      setProducts([{ name: "", description: "", price: "", image: null }]);
      setEditingRecipe(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRecipe = (recipe) => {
    setEditingRecipe(recipe);
    setTitle(recipe.title);
    setDescription(recipe.description);
    setCategory(recipe.category || "");
    setRegion(recipe.region || "");
    setIngredients(recipe.ingredients || [""]);
    setSteps(recipe.steps || [""]);
    setShowForm(true);
  };

  const handleDeleteRecipe = async (recipeId) => {
    if (!window.confirm("Are you sure you want to delete this recipe?")) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/user-recipes/${recipeId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      
      if (response.ok) {
        setUserRecipes(prev => prev.filter(recipe => recipe._id !== recipeId));
      }
    } catch (err) {
      setError("Failed to delete recipe");
    }
  };

  const cancelEdit = () => {
    setEditingRecipe(null);
    setTitle("");
    setDescription("");
    setCategory("");
    setRegion("");
    setIngredients([""]);
    setSteps([""]);
    setImage(null);
    setAddProducts(false);
    setProducts([{ name: "", description: "", price: "", image: null }]);
  };

  return (
    <div className="form-container">
      <button className="orange-btn" onClick={() => setShowForm(v => !v)}>
        {showForm ? `Close ${editingRecipe ? 'Edit' : 'Add'} Recipe Form` : "Add Recipe"}
      </button>

      {showForm && (
        <form onSubmit={handleSubmit} style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2>{editingRecipe ? 'Edit Recipe' : 'Add Your Recipe'}</h2>
            {editingRecipe && (
              <button type="button" className="cancel-btn" onClick={cancelEdit}>
                Cancel Edit
              </button>
            )}
          </div>
          {submittedRecipeId && (
            <div className="alert-success">
              Recipe added successfully! Your Recipe ID is: {submittedRecipeId}
            </div>
          )}
          {error && (
            <div className="alert-error">
              Error: {error}
            </div>
          )}

          <div>
            <label>Title:</label>
            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div>
            <label>Description:</label>
            <textarea required value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div>
            <label>Category:</label>
            <select value={category} onChange={(e) => {
              setCategory(e.target.value);
              setRegion("");
            }}>
              <option value="">Select</option>
              <option value="Veg">Veg</option>
              <option value="Non-Veg">Non-Veg</option>
            </select>
          </div>

          {category && (
            <div>
              <label>Region:</label>
              <select value={region} onChange={e => setRegion(e.target.value)} required>
                <option value="">Select Region</option>
                <option value="North Indian">North Indian</option>
                <option value="South Indian">South Indian</option>
                <option value="East Indian">East Indian</option>
                <option value="West Indian">West Indian</option>
              </select>
            </div>
          )}

          <div className="ingredients-section">
            <label>Ingredients:</label>
            <textarea
              placeholder="List each ingredient on a new line"
              required
              value={ingredients.join("\n")}
              onChange={(e) => setIngredients(e.target.value.split("\n"))}
              rows={5}
              className="ingredients-textarea"
            />
          </div>

          <div className="steps-section">
            <label>Preparation Steps:</label>
            {steps.map((step, idx) => (
              <div key={idx}>
                <input
                  type="text"
                  required
                  value={step}
                  onChange={(e) => handleStepChange(idx, e.target.value)}
                  placeholder={`Step ${idx + 1}`}
                />
                {steps.length > 1 && (
                  <button type="button" className="btn-icon" onClick={() => handleRemoveStep(idx)} title="Remove">
                    <FaMinus />
                  </button>
                )}
                {idx === steps.length - 1 && (
                  <button type="button" className="btn-icon" onClick={handleAddStep} title="Add">
                    <FaPlus />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div>
            <label>Recipe Image:</label>
            <input type="file" accept="image/*" onChange={handleRecipeImageChange} />
            {image && (
              <div>
                <img src={URL.createObjectURL(image)} alt="Preview" />
              </div>
            )}
          </div>

          <div>
            <label>
              <input type="checkbox" checked={addProducts} onChange={() => setAddProducts(v => !v)} />
              Add related products
            </label>
          </div>

          {addProducts && products.map((prod, idx) => (
            <div
              key={idx}
              className="product-section"
            >
              <h4>Product {idx + 1}</h4>
              <input
                type="text"
                placeholder="Product name"
                required
                value={prod.name}
                onChange={(e) => handleProductChange(idx, "name", e.target.value)}
              />
              <input
                type="text"
                placeholder="Product description"
                required
                value={prod.description}
                onChange={(e) => handleProductChange(idx, "description", e.target.value)}
              />
              <input
                type="number"
                placeholder="Product price"
                required
                value={prod.price}
                onChange={(e) => handleProductChange(idx, "price", e.target.value)}
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleProductImageChange(idx, e.target.files[0])}
              />
              {prod.image && (
                <div>
                  <img src={URL.createObjectURL(prod.image)} alt="Preview" style={{ maxWidth: 80, margin: 6 }} />
                </div>
              )}
              {products.length > 1 && (
                <button type="button" className="btn-icon" onClick={() => handleRemoveProduct(idx)}>
                  <FaMinus />
                </button>
              )}
              {idx === products.length - 1 && (
                <button type="button" className="btn-icon" onClick={handleAddProduct}>
                  <FaPlus />
                </button>
              )}
            </div>
          ))}

          <button type="submit" className="orange-btn" style={{ marginTop: 16 }} disabled={loading}>
            {loading 
              ? (editingRecipe ? "Updating..." : "Submitting...") 
              : (editingRecipe ? "Update Recipe" : "Submit Recipe")
            }
          </button>
        </form>
      )}

      <h3>Your Submitted Recipes</h3>
      <div className="recipe-list-container">
        {loadingRecipes ? (
          <p>Loading your recipes...</p>
        ) : userRecipes.length > 0 ? (
          <div className="recipe-grid">
            {userRecipes.map((recipe) => (
              <div key={recipe._id} className="recipe-card">
                {recipe.image && (
                  <img 
                    src={recipe.image} 
                    alt={recipe.title} 
                    className="recipe-card-image"
                  />
                )}
                <div className="recipe-card-content">
                  <h4 className="recipe-title">{recipe.title}</h4>
                  <p className="recipe-description">
                    {recipe.description && recipe.description.length > 100 
                      ? `${recipe.description.substring(0, 100)}...`
                      : recipe.description
                    }
                  </p>
                  
                  {recipe.category && (
                    <span className="recipe-category">{recipe.category}</span>
                  )}
                  
                  {recipe.ingredients && recipe.ingredients.length > 0 && (
                    <div className="recipe-ingredients">
                      <strong>Ingredients ({recipe.ingredients.length}):</strong>
                      <ul>
                        {recipe.ingredients.slice(0, 3).map((ingredient, idx) => (
                          <li key={idx}>{ingredient}</li>
                        ))}
                        {recipe.ingredients.length > 3 && (
                          <li>... and {recipe.ingredients.length - 3} more</li>
                        )}
                      </ul>
                    </div>
                  )}
                  
                  <div className="recipe-meta">
                    <small>Created: {new Date(recipe.createdAt).toLocaleDateString()}</small>
                  </div>
                  
                  <div className="recipe-actions">
                    <button 
                      className="btn-edit" 
                      onClick={() => handleEditRecipe(recipe)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-view" 
                      onClick={() => setSelectedRecipe(recipe)}
                    >
                      View Full
                    </button>
                    <button 
                      className="btn-delete" 
                      onClick={() => handleDeleteRecipe(recipe._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>
            No recipes added by you yet. Add your recipe by clicking the "Add Recipe" button above.
          </p>
        )}
      </div>

      {/* Recipe Detail Modal */}
      {selectedRecipe && (
        <div className="modal-backdrop" onClick={() => setSelectedRecipe(null)}>
          <div className="recipe-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedRecipe.title}</h3>
              <button className="close-btn" onClick={() => setSelectedRecipe(null)}>×</button>
            </div>
            <div className="modal-content">
              {selectedRecipe.image && (
                <img 
                  src={selectedRecipe.image} 
                  alt={selectedRecipe.title} 
                  className="modal-recipe-image"
                />
              )}
              <p><strong>Description:</strong> {selectedRecipe.description}</p>
              
              {selectedRecipe.category && (
                <p><strong>Category:</strong> {selectedRecipe.category}</p>
              )}
              
              {selectedRecipe.region && (
                <p><strong>Region:</strong> {selectedRecipe.region}</p>
              )}
              
              {selectedRecipe.ingredients && selectedRecipe.ingredients.length > 0 && (
                <div>
                  <h4>Ingredients:</h4>
                  <ul>
                    {selectedRecipe.ingredients.map((ingredient, idx) => (
                      <li key={idx}>{ingredient}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              {selectedRecipe.steps && selectedRecipe.steps.length > 0 && (
                <div>
                  <h4>Cooking Steps:</h4>
                  <ol>
                    {selectedRecipe.steps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddRecipeForm;
