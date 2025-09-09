import { useNavigate } from "react-router-dom";

const productsList = [
  {
    title: "Lasanha",
    description: "Lasanha Bolonhesa",
    price: 12.00,
    foto: "lasanha.jpg",
  },
  {
    title: "Fatia de Pizza",
    description: "Pizza de Pepperoni",
    price: 10.00,
    foto: "pizza.jpg",
  },
  {
    title: "Xis tudo",
    description: "Xis tudo grande",
    price: 25.00,
    foto: "xis.jpg",
  }
];

function CardProduto({ product, onBuy }) {
  
  return (
    <div className="card">
      <img
        src={product.foto}
        alt="foto"
        className="w-full h-auto rounded-t-[2rem]"
      />
      <div className="items-center justify-start flex flex-col w-full">
        <h3 className="font-semibold text-center mt-1">{product.title}</h3>
      </div>
      <div className="ml-3 mr-3 flex flex-row items-center justify-between gap-4 mt-2">
        <p className="m-0">R$ {product.price.toFixed(2)}</p>
        <button
          onClick={onBuy} 
          className="bg-green-600 w-32 rounded hover:bg-green-700 text-white font-medium transition-colors"
        >
          Comprar
        </button>
      </div>
    </div>
  );
}

function Products({ user }) {
  const navigate = useNavigate();

  function handleBuy(product, user) {
  if (!user) {
    alert("Entre com sua conta Google para comprar.");
  } else {
    // Passando apenas os dados essenciais do usuário
    const simpleUser = {
      email: user.email,
      name: user.displayName,
      uid: user.uid
    };

    navigate("/comprar", { state: { product, user: simpleUser } });
  }
}

  return (
    <section className="produtos">
      {productsList.map((product, index) => (
        <CardProduto 
          key={index}
          product={product}
          onBuy={() => handleBuy(product, user)} 
        />
      ))}
    </section>
  );
}

export default Products;
