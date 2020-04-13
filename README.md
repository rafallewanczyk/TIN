Smarthome - dokumentacja
Podział obowiązków:
Jarek Glegoła - C++, typescript - urządzenie temperatury
Rafał Lewańczyk- C# - regulator światła i urządzenie światła
Artur Wyrozębski - Python - regulator temperatury
Kacper Biegajski - Java - serwer z baza danych

Struktura projektu




Odpowiedzialność modułów:
Klient 
Wyświetlanie żądanych danych
Modyfikowanie ustawień urządzeń
Sterowanie urządzeniami
Dodawanie i usuwanie urządzeń
Serwer 
Przetwarzanie danych
Komunikacja z bazą danych
Komunikacja i udostępnianie API klientowi
Zbieranie danych 
Przesyłanie konfiguracji urządzeń
Baza danych
Przechowywanie danych historycznych (logów)
Regulator
Zarządzanie stanem urządzeń zgodnie z konfiguracją
Przesyłanie danych urządzeń do serwera 
Pobieranie konfiguracji
Światło
Sterowanie oświetleniem
Udostępnianie informacji na temat swojego stanu (włączony/wyłączony)
Urządzenie temperatury
Regulacja mocy urządzenia
Udostępnianie informacji na temat swojego stanu (aktualna temperatura)


Opis komunikacji
W nawiasach jest opisane jaka strukturę będzie miała wiadomość.
Typ widomości ma 24 bajty
Dane będa przesyłane jako strumień i przetwarzane zgodnie z typem wiadomości.
Urządzenie temperatury - regulator temperatury:
Regulator -> Urządzenie:
Zmień docelową temperaturę 
(domyślne nagłówki) (typ wiadomości = CHANGE_TEMP) (docelowa temperatura) [double - 8B]
Ping - (domyślne nagłówki) (typ wiadomości = PING) 
Podaj temperaturę 
(domyślne nagłówki) (typ wiadomości = GET_TEMP)



Urządzenie -> Regulator:
Aktualna temperatura urządzenia 
(domyślne nagłówki) (typ wiadomości = CURR_TEMP) (aktualna temperatura) [double - 8B]
Ping return 
(domyślne nagłówki) (typ wiadomości = PING_RETURN) 

Serwer - regulator:
Serwer -> Regulator:
Zmień konfigurację urządzenia
(domyślne nagłówki) (typ wiadomości = CHANGE_CONFIG) (typ urzadzenia) [24B] (nowa konfiguracja cała) List< (id urzadzenia) [int - 4B] (klucz publiczny) [4KB] parametr [X B] >
Zmień parametry urządzenia
(domyślne nagłówki) (typ wiadomości = CHANGE_PARAMS) (typ urzadzenia) [24B] (parametr) [X B]
Ping 
(domyślne nagłówki = PING) (typ wiadomości)
Regulator -> Serwer:
Wyślij dane z urządzeń
(domyślne nagłówki) (typ wiadomości = CURR_DATA) (typ urzadzenia) [24B] (aktualne stany wszystkich urządzeń) List< (id [4 B], parametr [X B] } >
Ping return 
(domyślne nagłówki) (typ wiadomości = PING) 
Urządzenie oświetlenia - regulator oświetlenia:
Regulator -> Urządzenie: 
Zapal/Zgaś światło 
(domyślne nagłówki) (typ wiadomości - CHANGE_LIGHT) (operacja) [short 1B]
Ping 
(domyślne nagłówki) (typ wiadomości = PING)
Podaj stan oświetlenia
(domyślne nagłówki) (typ wiadomości = GET_LIGHT)
Urządzenie -> Regulator: 
Stan oświetlenia (domyślne nagłówki) (typ wiadomości = CURR_LIGHT) (stan światła) [short 1B]
Ping return (domyślne nagłówki) (typ wiadomości = PING_RETURN)
Serwer - Klient:
Serwer -> Klient:
Komunikacja HTTP poprzez REST API. Api do uzgodnienia po implementacji urządzeń.

Klient -> Serwer:
Zaloguj się
Podaj stan urządzenia
Pobierz dane historyczne (logi)
Pobierz listę urządzeń
Dodaj regulator
Dodaj urządzenie
Potencjalne błędy komunikacji
Ogólne błędy przy komunikacji socketami:
Nie udało się odszyfrować danych
Nieznana wersja protokołu
Brak połączenia  z odbiorcą
Przerwanie połączenia
Podpis się nie zgadza - błędne uwierzytelnienie
Brak ID urządzenia w pamięci 
Liczba odebranych bajtów się nie zgadza


Opis protokołu TSHP
Nagłówek:
4 B - int32 - wersja protokołu
4 B - int32 - liczba przesyłanych bajtów
4 B - int32 - id wysyłającego
N B - Dane
N B - Podpis
Do stworzenia podpisu wykorzystana zostanie funkcja skrótu SHA-256 i zostanie on zaszyfrowany kluczem prywatnym nadawcy algorytmem RSA. Ten sam algorytm będzie również użyty do przesłania całości wiadomości poprzez szyfrowanie kluczem publicznym odbiorcy.






Przykładowe sekwencje

Jeżeli nie uda się podłączyć do jednego z kilku podanych regulatorów serwer zwróci odpowiednie informacje, i udane połączenia pozostaną. Użytkownik będzie mógł ponowić połączenie z regulatorem

Jeżeli regulatorowi nie uda się połączyć z urządzeniem podczas operacji “podaj stan” to w logu zostanie umieszczony zapis o błędzie zamiast aktualnego stanu urządzenia. 
Jeżeli nie uda się połączyć serwera z regulatorem, serwer zwróci tę informację klientowi..


