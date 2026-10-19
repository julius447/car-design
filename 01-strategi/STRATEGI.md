# Steg 1: Strategi

## Vad underlaget visade

1. **Bilarna har kvar den gamla loggan.** Ampy Brandbook (sep 2025, Google Drive, mappen BRANDBOOK) har en ny logga, med blixten utskuren ur a:et och ingen ruta runt, samt en ny palett:
   - primärt: marinblått `#090b32`, elblått `#326afd`, neongrönt `#55ff9a`, ljust `#f5f9ff`
   - sekundärt: `#5eb1bf` och `#92ec47`
   - typsnitt: Outfit (Light, Medium, Black)

   Dekoren blir därmed första gången den nya identiteten syns på gatan. Ampys design system för interna verktyg anger turkos `#00a991`, som är den gamla loggans färg. Här följer vi brandbooken.
2. **Flottan är Caddy 4 och Transporter T6/T6.1.** Bilderna i ZIP-filen är annonsbilder av flera generationer. Mallarna i `mallar/` är byggda för de generationer som syns på era riktiga bilar.
3. **Ordlistan når inte fram på avstånd.** På fotot från motorvägen (`bilder/nuvarande-25m.jpg`, cirka 25 m) går loggan och telefonnumret att läsa. Raden "service · elinstallationer · smarta hem" och linjeillustrationen gör det inte.

## Antaganden att bekräfta

- Kort hjulbas på båda bilarna.
- Skjutdörr bara på höger sida.
- Bakdörrar utan fönster (bekräftat av er). Caddy 4:s bakdörrar är osymmetriska, och den vänstra är bredare.
- Tanklockets plats är markerad i mallarna men inte kontrollerad.
- Bilarna är leasade, så folien ska vara gjuten och gå att ta bort utan skador.
- Mallarna har en noggrannhet på cirka ±3 %. Tryckfiler görs på köpt produktionsmall eller på uppmätt bil.

## Saknas

- **Fyra mobilfoton per bil och registreringsnumren.** De avgör takräcke, skyddslister och dragkrok. Behövs före steg 3.
- **Adressen till landningssidan bakom QR-koden.** Förslag: en kort adress per bil, till exempel `ampy.se/hej?bil=t61-01`.

## Motsättningen och signalen

Utan ord vet ingen att Ampy är en elfirma. Med en ordlista ser ni ut som vilken hantverkare som helst. Lösningen är att använda **en symbol: blixten**.

- Den läses som "el" på en bråkdels sekund och utan språk.
- Ni äger den redan. Den sitter i a:et, och brandbooken säger att grafiska former ska byggas av blixten eller a:et.
- Den skalar. En blixt på två meter syns på 50 meter, men ett ord på samma yta gör det inte.
- **Risken** är att blixten är vanlig bland elfirmor. Därför använder vi bara er exakta geometri, i stor skala och beskuren av bilens kanter. 3-sekunderstestet i steg 4 avgör om det räcker.

## Meddelandehierarki

| Avstånd | Situation | Vad som syns | Regel |
|---|---|---|---|
| 30 m | Passerar i trafik, 1–2 s | Form, färg, blixt och logga | Loggans x-höjd minst 25 cm, vilket ger en logga på minst ~1,4 m (T6.1) och ~1,25 m (Caddy). Tumregel: 25 mm per 3 m läsavstånd. |
| 10 m | Kö eller rödljus, 3–5 s | En mening | Förslag att testa: **«Elen, uppgraderad.»**, «Modern el för moderna hem.», «Laddat för framtiden.» Versalhöjd minst 9 cm. |
| 2 m | Parkerad hos kund | QR-kod, «Scanna för överraskning», ampy.se | QR minst 20 cm på sidan och 25–30 cm bak, felkorrigering H. Placering: höger framdörr och höger bakdörr. |

QR-koden sitter inte på bakre sidoplåten, eftersom skjutdörren täcker den när den är öppen. Koden skannas av passagerare och gående, inte av förare, eftersom handhållen mobil är förbjuden under körning. Telefonnumret flyttas till landningssidan.

## Systemregel

Folien läggs i lager:

- **L0, vit bil:** lacken, ingen folie.
- **L1, märkning = delvis foliering:** logga, blixt, mening och QR. Samma storlek och plats på alla bilar.
- **L2, yta:** färgfält eller mönster. Full foliering = L1 + L2.

Delvis foliering är alltså alltid en delmängd av full. Därför ser en halvfolierad Caddy och en helfolierad Transporter ut som samma märke.

Placeringsregler:

- **Slaskzonen:** inget som ska läsas i nedre tredjedelen, alltså under ~67 cm på T6.1 och under skyddslisten på Caddy 4. En mörk underdel i full foliering döljer dessutom salt och smuts.
- **Vänster sida** möter trafiken, så den görs störst och enklast. **Höger sida** möter trottoaren och kunden, och där sitter QR-koden.
- Aldrig över handtag, skyddslist, tanklock eller skjutdörrsskena. Loggan får korsa en dörrspringa men aldrig ett handtag.
- Främre sidorutor folieras aldrig.
- **Framtida bilar** (t.ex. ID. Buzz) får samma L1, placerad efter B-stolpen och bakkanten. L2 anpassas efter bilens form.
