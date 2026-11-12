# DS Hauling — daftar pencabutan ruang kerja

Disajikan GitHub Pages di `https://trust.ds-groups.com/hauling/trust.json`.
Aplikasi mobile DS Hauling memverifikasi isinya; tidak ada rahasia di repo ini.

| File | Ditandatangani | Kapan berubah |
|---|---|---|
| `revocations.signed` | kunci utama DS Groups (offline) | hanya saat mencabut |
| `hauling/trust.json` | timestamp oleh kunci perpanjangan (`FRESHNESS_KEY`) | setiap hari, otomatis |

Timestamp berlaku 14 hari; aplikasi memberi masa tenggang 30 hari untuk sesi yang sudah login.

## Mencabut ruang kerja
1. Di komputer pemegang kunci, ubah `~/.dsgroup-hauling/revocations.source.json`:
   naikkan `seq` dan tambahkan entri, misalnya
   `{"workspace_id": "<uuid>", "reason": "kontrak berakhir"}`,
   `{"origin": "https://lama.contoh.co.id"}`, atau
   `{"workspace_id": "<uuid>", "issued_before": <unix detik>}` (cabut manifest lama saja).
2. Dari checkout SAIND:
   `php artisan mobile:revocation-list ~/.dsgroup-hauling/revocations.source.json --key=$HOME/.dsgroup-hauling/workspace-signing.key > revocations.signed`
3. Commit & push `revocations.signed`. Workflow langsung menerbitkan `trust.json` baru.

## Jika workflow gagal
GitHub mengirim email. Jalankan ulang dari tab Actions (`workflow_dispatch`).
Sebelum 14 hari, login baru di aplikasi akan tertahan sampai `trust.json` diperbarui.
