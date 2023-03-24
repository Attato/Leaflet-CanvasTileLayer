import './styles/globals.scss';
import './styles/map.scss';

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang='ru'>
			<head />
			<body>{children}</body>
		</html>
	);
}
