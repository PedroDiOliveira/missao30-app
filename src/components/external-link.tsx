import { Link } from 'expo-router';
import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { type ComponentProps } from 'react';

// Componente do template original, não usado em nenhuma tela do app ainda.
// `href` fica tipado como `string` (URL externa de verdade, nunca uma rota
// interna) em vez de depender do union gerado por `typed-routes` — esse
// union muda de forma toda vez que uma rota nova é registrada, e já
// quebrou o build duas vezes por causa disso.
type Props = Omit<ComponentProps<typeof Link>, 'href'> & { href: string };

export function ExternalLink({ href, ...rest }: Props) {
  return (
    <Link
      target="_blank"
      {...rest}
      href={href as ComponentProps<typeof Link>['href']}
      onPress={async (event) => {
        if (process.env.EXPO_OS !== 'web') {
          // Prevent the default behavior of linking to the default browser on native.
          event.preventDefault();
          // Open the link in an in-app browser.
          await openBrowserAsync(href, {
            presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
          });
        }
      }}
    />
  );
}
