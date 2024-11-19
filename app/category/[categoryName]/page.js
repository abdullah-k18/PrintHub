export default function CategoryPage({ params }) {
    console.log("Params:", params);
    const { categoryName } = params;
  
    return (
      <div className="p-8 bg-gray-100 min-h-screen">
        <h1 className="text-2xl font-bold text-center mb-4">{categoryName.replace(/-/g, " ")}</h1>
        <p className="text-center text-gray-700">
          Welcome to the {categoryName.replace(/-/g, " ")} category.
        </p>
      </div>
    );
  }
  