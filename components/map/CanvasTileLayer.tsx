import L from "leaflet";

// Определяем размер тайла
const tileSize = 256;

// Определяем класс для нашего CanvasTileLayer
class CanvasTileLayer extends L.TileLayer {
	// Создаем тайл
	createTile(coords: L.Coords, done: L.DoneCallback) {
		// Создаем canvas элемент
		const canvas = L.DomUtil.create(
			"canvas",
			"leaflet-tile",
		) as HTMLCanvasElement;

		// Задаем размер canvas
		canvas.width = tileSize;
		canvas.height = tileSize;

		// Создаем новый Image элемент
		const img = new Image();

		// Задаем обработчики событий для загрузки и ошибки
		img.onload = () => {
			const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
			ctx.drawImage(img, 0, 0, tileSize, tileSize);
			// @ts-ignore
			done(null, canvas);
		};

		img.onerror = () => {
			done(new Error(`Failed to load tile ${this.getTileUrl(coords)}`));
		};

		// Устанавливаем путь к изображению
		img.src = this.getTileUrl(coords);

		// Возвращаем canvas элемент
		return canvas;
	}
}

export default CanvasTileLayer;
