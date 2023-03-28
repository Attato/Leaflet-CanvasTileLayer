import L from 'leaflet';

class CanvasTileLayer extends L.TileLayer {
	tileSize: L.Point;
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D | null;
	geoPositionBeforeZoom: L.LatLng | undefined;
	imageData: ImageData | undefined;
	srcPos: L.Point;

	constructor(urlTemplate: string, options?: L.TileLayerOptions) {
		super(urlTemplate, options);

		this.tileSize = this.getTileSize();
		this.canvas = L.DomUtil.create(
			'canvas',
			'leaflet-tile-pane leaflet-zoom-animated',
		);
		this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
		this.srcPos = new L.Point(0, 0);

		this.canvas.width = window.innerWidth;
		this.canvas.height = window.innerHeight;
	}

	createTile(coords: L.Coords, done: L.DoneCallback): HTMLImageElement {
		const tile = super.createTile(coords, done) as HTMLImageElement;
		tile.crossOrigin = 'Anonymous';
		const url = this.getTileUrl(coords);

		this.canvasRedraw(tile, url, coords);

		return tile;
	}

	private canvasRedraw(tile: HTMLImageElement, url: string, coords: L.Coords) {
		// @ts-ignore
		const pos = this._getTilePos(coords);

		tile.onload = () => {
			// delete the original tile that was created with createTile
			this.removeTileElement(tile);
			const posCanvas = L.DomUtil.getPosition(this.canvas);
			console.log();

			this.srcPos = this._map.latLngToLayerPoint(
				// @ts-ignore
				this._map.unproject(this._level.origin),
			);

			this.ctx?.drawImage(
				tile,
				pos.x - posCanvas.x + this.srcPos.x,
				pos.y - posCanvas.y + this.srcPos.y,
				this.tileSize.x,
				this.tileSize.y,
			);
		};

		tile.onerror = () => {
			console.log(`Failed to load tile: ${url}`);
		};
	}

	removeTileElement(tile: HTMLElement) {
		tile.parentNode?.removeChild(tile);
	}

	onAdd(map: L.Map): this {
		super.onAdd(map);

		this.getPane()?.appendChild(this.canvas);

		map.on('zoomstart', () => {
			const currentBounds = map.getPixelBounds();

			if (currentBounds.min) {
				this.geoPositionBeforeZoom = this._map.layerPointToLatLng(
					currentBounds.min,
				);
			}

			const imageData = this.ctx?.getImageData(
				0,
				0,
				this.canvas.width,
				this.canvas.height,
			);

			this.imageData = imageData;
		});

		const scale = map.options.crs?.scale(map.getZoom());

		map.on('zoomend', () => {
			const currentBounds = map.getPixelBounds();

			const layerPositionBeforeZoom = this._map.latLngToLayerPoint(
				this.geoPositionBeforeZoom!,
			);

			const zoomDeltaX = currentBounds.min
				? Math.floor(currentBounds.min.x - layerPositionBeforeZoom.x)
				: 0;
			const zoomDeltaY = currentBounds.min
				? Math.floor(currentBounds.min.y - layerPositionBeforeZoom.y)
				: 0;

			const newScale = map.options.crs?.scale(map.getZoom());
			const deltaScale = newScale! / scale!;

			this.ctx?.putImageData(
				this.imageData!,
				-zoomDeltaX,
				-zoomDeltaY,
				0,
				0,
				this.canvas.width * deltaScale,
				this.canvas.height * deltaScale,
			);
		});

		// _setView
		map.on('zoomanim', (event: L.ZoomAnimEvent) => {
			let tileZoom: number | undefined = Math.round(this._map.getZoom());

			if (
				(this.options.maxZoom !== undefined &&
					tileZoom > this.options.maxZoom) ||
				(this.options.minZoom !== undefined && tileZoom < this.options.minZoom)
			) {
				tileZoom = undefined;
			} else {
				// @ts-ignore
				tileZoom = this._clampZoom(tileZoom);
			}

			const containerPointToLatLng = map.containerPointToLayerPoint([0, 0]);
			const newScale = map.options.crs?.scale(map.getZoom());
			const deltaScale = newScale! / scale!;

			const translate = this._map.unproject(
				this._level.origin
					.multiplyBy(scale)
					.subtract(this._map._getNewPixelOrigin(map.getCenter(), deltaScale))
					.round(),
			);

			console.log();

			L.DomUtil.setTransform(
				this.canvas,
				map.getCenter().latLngToLayerPoint(),
				deltaScale,
			);
		});

		// в зуменд анимацию убирать

		map.on('moveend', () => {
			const containerPointToLatLng = map.containerPointToLayerPoint([0, 0]);

			L.DomUtil.setPosition(this.canvas, containerPointToLatLng);

			const pos = L.DomUtil.getPosition(this.canvas);

			this.ctx?.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.ctx?.clearRect(0, this.srcPos.y, this.canvas.width, this.srcPos.y);

			const imageData = this.ctx?.getImageData(
				0,
				0,
				this.canvas.width,
				this.canvas.height,
			);

			this.ctx?.putImageData(
				imageData!,
				pos.x - containerPointToLatLng.x,
				pos.y - containerPointToLatLng.y,
			);

			for (const tile of Object.values(this._tiles)) {
				// @ts-ignore
				const pos = this._getTilePos(tile.coords);
				this.ctx?.drawImage(
					tile.el as HTMLImageElement,
					pos.x - containerPointToLatLng.x + this.srcPos.x,
					pos.y - containerPointToLatLng.y + this.srcPos.y,
					this.tileSize.x,
					this.tileSize.y,
				);
			}
		});

		return this;
	}
}

export default CanvasTileLayer;
