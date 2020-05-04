# Smarthome - dokumentacja

## Podział obowiązków:

1. Jarek Glegoła - C++, typescript - urządzenie temperatury
2. Rafał Lewańczyk- C# - regulator światła i urządzenie światła
3. Artur Wyrozębski - Python - regulator temperatury
4. Kacper Biegajski - Java - serwer z baza danych

## Struktura projektu

![Project Structure](/resources/structure.png)

## Odpowiedzialność modułów:

1. Klient

   - Wyświetlanie żądanych danych
   - Modyfikowanie ustawień urządzeń
   - Sterowanie urządzeniami
   - Dodawanie i usuwanie urządzeń

2. Serwer

   - Przetwarzanie danych
   - Komunikacja z bazą danych
   - Komunikacja i udostępnianie API klientowi
   - Zbieranie danych
   - Przesyłanie konfiguracji urządzeń

3. Baza danych

   - Przechowywanie danych historycznych (logów)

4. Regulator

   - Zarządzanie stanem urządzeń zgodnie z konfiguracją
   - Przesyłanie danych urządzeń do serwera
   - Pobieranie konfiguracji

5. Urządzenie świetlne

   - Sterowanie oświetleniem
   - Udostępnianie informacji na temat swojego stanu (włączony/wyłączony)

6. Urządzenie termiczne

   - Regulacja mocy urządzenia
   - Udostępnianie informacji na temat swojego stanu (aktualna temperatura)

## Opis komunikacji

W nawiasach jest opisane jaka strukturę będzie miała wiadomość.
Typ widomości ma 24 bajty.
Dane będa przesyłane jako strumień i przetwarzane zgodnie z typem wiadomości.

### Urządzenie temperatury - regulator temperatury:

#### Regulator -> Urządzenie:

- Zmień docelową temperaturę
  (domyślne nagłówki) (typ wiadomości = CHANGE_TEMP) (docelowa temperatura) [double - 8B]
- Ping - (domyślne nagłówki) (typ wiadomości = PING)
- Podaj temperaturę
  (domyślne nagłówki) (typ wiadomości = GET_TEMP)

#### Urządzenie -> Regulator:

- Aktualna temperatura urządzenia
  (domyślne nagłówki) (typ wiadomości = CURR_TEMP) (aktualna temperatura) [double - 8B]
- Ping return
  (domyślne nagłówki) (typ wiadomości = PING_RETURN)

### Serwer - regulator:

#### Serwer -> Regulator:

- Zmień konfigurację urządzenia
  (domyślne nagłówki) (typ wiadomości = CHANGE_CONFIG) (typ urzadzenia) [24B] (nowa konfiguracja cała) List< (id urzadzenia) [int - 4B] (klucz publiczny) [4KB] parametr [X B] >
- Zmień parametry urządzenia
  (domyślne nagłówki) (typ wiadomości = CHANGE_PARAMS) (typ urzadzenia) [24B](parametr) [X B]
- Ping
  (domyślne nagłówki = PING) (typ wiadomości)

#### Regulator -> Serwer:

- Wyślij dane z urządzeń
  (domyślne nagłówki) (typ wiadomości = CURR_DATA) (typ urzadzenia) [24B] (aktualne stany wszystkich urządzeń) List< (id [4 B], parametr [X B] } >
- Ping return
  (domyślne nagłówki) (typ wiadomości = PING)

### Urządzenie oświetlenia - regulator oświetlenia:

#### Regulator -> Urządzenie:

- Zapal/Zgaś światło
  (domyślne nagłówki) (typ wiadomości - CHANGE_LIGHT) (operacja) [short 1B]
- Ping
  (domyślne nagłówki) (typ wiadomości = PING)
- Podaj stan oświetlenia
  (domyślne nagłówki) (typ wiadomości = GET_LIGHT)

#### Urządzenie -> Regulator:

- Stan oświetlenia (domyślne nagłówki) (typ wiadomości = CURR_LIGHT) (stan światła) [short 1B]
- Ping return (domyślne nagłówki) (typ wiadomości = PING_RETURN)

### Serwer - Klient:

#### Serwer -> Klient:

- Komunikacja HTTP poprzez REST API. Api do uzgodnienia po implementacji urządzeń.

#### Klient -> Serwer:

- Zaloguj się
- Podaj stan urządzenia
- Pobierz dane historyczne (logi)
- Pobierz listę urządzeń
- Dodaj regulator
- Dodaj urządzenie

## API
```text
// undefined oznacza, że może nie być tego w requeście
{
  //GET /devices - zwrotka
  "devices": [
    {
      "id": "string",
      "regulatorId": "string",
      "name": "string",
      "status": "ENUM: ACTIVE | INACTIVE | INVALID | CONNECTING",
      "type": "ENUM: TEMPERATURE | LIGHT",
      "data": "string | boolean",
      "targetData": "string | boolean"
    }
    // ...
  ],

  //POST /devices - request klienta
  "body": {
    "regulatorId": "string",
    "name": "string",
    "publicKey": "BASE64 encoded string"
  },

  //PATCH /devices/:deviceId request klienta
  "body": {
    "regulatorId": "string | undefined",
    "name": "string | undefined",
    "publicKey": "BASE64 encoded string | undefined"
  },
  // ...,

  //DELETE /devices/:deviceId
  "body": {},

  // POST /devices/setTargetData
  "body": {
    "id": "string",
    "targetData": "string | boolean"
  },

  //GET /regulators - tak powinna wyglądać zwrotka
  "regulators": [
    {
      "id": "string",
      "name": "string",
      "status": "ENUM: ACTIVE | INACTIVE | INVALID | CONNECTING",
      "type": "ENUM: TEMPERATURE | LIGHT"
    }
    // ...
  ],

  //POST /regulators request klienta
  "body": {
    "regulatorId": "string",
    "name": "string",
    "publicKey": "BASE64 encoded string"
  }

  //PATCH /regulators/:regulatorId request klienta
  "body": {
    "type": "ENUM: TEMPERATURE | LIGHT",
    "name": "string | undefined",
    "publicKey": "BASE64 encoded string | undefined"
  },

  // DELETE /regulators/:deviceId
  "body": {}
}

// ERROR jeżeli będzie jakiś błąd to chciałbym otrzymać takie body
  "error": "string"

// albo
  "errors": [
    "string",
    ...
  ]
```


## Potencjalne błędy komunikacji

Ogólne błędy przy komunikacji socketami:

- Nie udało się odszyfrować danych
- Nieznana wersja protokołu
- Brak połączenia z odbiorcą
- Przerwanie połączenia
- Podpis się nie zgadza - błędne uwierzytelnienie
- Brak ID urządzenia w pamięci
- Liczba odebranych bajtów się nie zgadza

## Opis protokołu TSHP

Nagłówek:

1. 4 B - int32 - wersja protokołu
2. 4 B - int32 - liczba przesyłanych bajtów
3. 4 B - int32 - id wysyłającego
4. N B - Dane
5. N B - Podpis

Do stworzenia podpisu wykorzystana zostanie funkcja skrótu SHA-256 i zostanie on zaszyfrowany kluczem prywatnym nadawcy algorytmem RSA. Ten sam algorytm będzie również użyty do przesłania całości wiadomości (bez nagłowka) poprzez szyfrowanie kluczem publicznym odbiorcy.

## Przykładowe sekwencje

![First Connection Sequence](/resources/first_connection_sequence.png)

Jeżeli nie uda się podłączyć do jednego z kilku podanych regulatorów serwer zwróci odpowiednie informacje, i udane połączenia pozostaną. Użytkownik będzie mógł ponowić połączenie z regulatorem

![First Connection Sequence](/resources/data_collection_sequence.png)

Jeżeli regulatorowi nie uda się połączyć z urządzeniem podczas operacji “podaj stan” to w logu zostanie umieszczony zapis o błędzie zamiast aktualnego stanu urządzenia.
Jeżeli nie uda się połączyć serwera z regulatorem, serwer zwróci tę informację klientowi.
