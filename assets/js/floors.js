// 上から下への並び順。idは重複しない固定値にしてください。
// 将来個別ページを作成したら、urlに相対パスを設定します。
window.Sawara = {
  initialFloorId: '1f',
  floors: [
    { id: '5f', label: '5F', name: 'うんち', order: 10, zone: 'building', url: null, elevation: 11.02, modelRange: [11.02, 13.75] },
    { id: '4f', label: '4F', name: 'ARCHITECTURE', order: 20, zone: 'building', url: null, elevation: 8.29, modelRange: [8.29, 11.02] },
    { id: '3f', label: '3F', name: 'CAMERA PHOTOGRAPH', order: 30, zone: 'building', url: null, elevation: 5.56, modelRange: [5.56, 8.29] },
    { id: '2f', label: '2F', name: 'LIBRARY', order: 40, zone: 'building', url: null, elevation: 2.83, modelRange: [2.83, 5.56] },
    { id: '1f', label: '1F', name: 'CAFE BIKE', order: 50, zone: 'building', url: './cafe/index.html', elevation: .10, modelRange: [.10, 2.83], tenants: [
      { id: 'cafe', name: 'CAFE', url: './cafe/index.html' },
      { id: 'bike', name: 'BIKE', url: null }, // 制作後に相対URLを登録します。
    ] },
    { id: 'b1f', label: 'B1F', name: 'フリーペーパー', english: 'FREE PAPER', order: 60, zone: 'archives', url: './archives/index.html' },
    { id: 'b2f', label: 'B2F', name: '設計図集', english: 'ARCHITECTURE', order: 70, zone: 'archives', url: './archives/index.html' },
    { id: 'b3f', label: 'B3F', name: '財務資料', english: 'MONEY', order: 80, zone: 'archives', url: './archives/index.html' },
  ],
};
window.Sawara.floors.sort((a, b) => a.order - b.order);
