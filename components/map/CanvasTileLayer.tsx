import L from 'leaflet';

class CanvasTileLayer extends L.TileLayer {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D | null;
	tiles: { [key: string]: HTMLImageElement };
	tileSize: number | L.Point;
	currentView: L.Bounds;

	constructor(urlTemplate: string, options?: L.TileLayerOptions) {
		super(urlTemplate, options);

		this.canvas = document.createElement('canvas');
		this.ctx = this.canvas.getContext('2d');
		this.tiles = {};
		this.tileSize = options?.tileSize || 256;
		this.currentView = new L.Bounds();
	}

	onAdd(map: L.Map): this {
		super.onAdd(map);
		this.canvas.width = map.getSize().x;
		this.canvas.height = map.getSize().y;
		map.on('move', this.update, this);
		this.update();

		return this;
	}

	onRemove(map: L.Map): this {
		super.onRemove(map);
		map.off('move', this.update, this);

		return this;
	}

	update() {
		const map = this._map;
		if (!map) {
			return;
		}

		const pixelBounds = map.getPixelBounds();
		const tileSize = this.tileSize;
		const nwTilePoint = new L.Point(
			// @ts-ignore
			Math.floor(pixelBounds.min.x / tileSize),
			// @ts-ignore
			Math.floor(pixelBounds.min.y / tileSize)
		);

		console.log(nwTilePoint);

		const seTilePoint = new L.Point(
			// @ts-ignore
			Math.floor(pixelBounds.max.x / tileSize),
			// @ts-ignore
			Math.floor(pixelBounds.max.y / tileSize)
		);

		console.log(seTilePoint);

		const tileBounds = new L.Bounds(nwTilePoint, seTilePoint);

		if (this.currentView.equals(tileBounds)) {
			return;
		}

		this.currentView = tileBounds;

		console.log(this.currentView);

		const tiles: Record<string, HTMLImageElement> = {};
		for (let x = nwTilePoint.x; x <= seTilePoint.x; x++) {
			for (let y = nwTilePoint.y; y <= seTilePoint.y; y++) {
				const tileKey = `${x}:${y}`;
				if (this._tiles[tileKey]) {
					tiles[tileKey] = this._tiles[tileKey];
					delete this._tiles[tileKey];
				} else {
					this.loadTile(x, y, tileKey);
				}
			}
		}
		for (const tileKey in this._tiles) {
			this.removeTile(tileKey);
		}
		this._tiles = tiles;
	}

	loadTile(x: number, y: number, tileKey: string) {
		const img = new Image();
		img.crossOrigin = 'anonymous';
		img.onload = () => {
			this._tiles[tileKey] = img;
			this.drawTile(x, y, img);
		};
		img.src = this.getTileUrl(x, y);
	}

	removeTile(tileKey: string) {
		const img = this._tiles[tileKey];
		if (img && img.parentNode) {
			img.parentNode.removeChild(img);
		}
		delete this._tiles[tileKey];
	}

	drawTile(x: number, y: number, img: HTMLImageElement) {
		const tileSize = this.tileSize;
		const ctx = this.ctx;
		const canvasX = x * tileSize;
		const canvasY = y * tileSize;
		ctx?.drawImage(img, canvasX, canvasY, tileSize, tileSize);
	}
}

export default CanvasTileLayer;
