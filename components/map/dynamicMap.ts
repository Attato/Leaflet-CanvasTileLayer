import dynamic from 'next/dynamic';

const Map = dynamic(() => import('./map'), {
	// Устанавливаем параметр ssr в false, чтобы компонент не рендерился на стороне сервера
	ssr: false,
});

export default Map;
