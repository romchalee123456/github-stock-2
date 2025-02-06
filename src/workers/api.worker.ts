// Web Worker for handling API requests
self.onmessage = async (e) => {
  if (e.data.type === 'FETCH_PRODUCTS') {
    try {
      const response = await fetch('/api/1.1/wf/clothing');
      const data = await response.json();
      // Transform data and add quantity
      const productsWithQuantity = data.map((item: any) => ({
        id: item.id,
        name: item.name,
        image: item.image,
        price: parseFloat(item.price || '0'),
        quantity: 10
      }));
      // Post the processed data back to the main thread
      self.postMessage({ type: 'PRODUCTS_LOADED', data: productsWithQuantity });
    } catch (error) {
      self.postMessage({ 
        type: 'ERROR', 
        error: error instanceof Error ? error.message : 'An error occurred while fetching data'
      });
    }
  }
};
