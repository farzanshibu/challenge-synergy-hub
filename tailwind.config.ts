
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class", "system"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				challenge: {
					DEFAULT: 'rgb(255, 99, 132)',
					secondary: 'rgb(54, 162, 235)',
					success: 'rgb(75, 192, 192)',
					warning: 'rgb(255, 159, 64)',
					info: 'rgb(153, 102, 255)'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				'fade-out': {
					'0%': { opacity: '1' },
					'100%': { opacity: '0' }
				},
				'slide-in': {
					'0%': { transform: 'translateY(20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'pulse-subtle': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.8' }
				},
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-5px)' }
				},
				moveHorizontal: {
					"0%": {
					  transform: "translateX(-50%) translateY(-10%)",
					},
					"50%": {
					  transform: "translateX(50%) translateY(10%)",
					},
					"100%": {
					  transform: "translateX(-50%) translateY(-10%)",
					},
				  },
				  moveInCircle: {
					"0%": {
					  transform: "rotate(0deg)",
					},
					"50%": {
					  transform: "rotate(180deg)",
					},
					"100%": {
					  transform: "rotate(360deg)",
					},
				  },
				  moveVertical: {
					"0%": {
					  transform: "translateY(-50%)",
					},
					"50%": {
					  transform: "translateY(50%)",
					},
					"100%": {
					  transform: "translateY(-50%)",
					},
				  },
				  shake: {
					"0%": {
					  transform: "translateX(0)",
					},
					"10%": {
					  transform: "translateX(-5px)",
					},
					"20%": {
					  transform: "translateX(5px)",
					},
					"30%": {
					  transform: "translateX(-5px)",
					},
					"40%": {
					  transform: "translateX(5px)",
					},
					"50%": {
					  transform: "translateX(-5px)",
					},
					"60%": {
					  transform: "translateX(5px)",
					},
					"70%": {
					  transform: "translateX(-5px)",
					},
					"80%": {
					  transform: "translateX(-5px)",
					},
					"90%": {
					  transform: "translateX(5px)",
					},
					"100%": {
					  transform: "translateX(0)",
					},
				  },
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-out': 'fade-out 0.3s ease-out',
				'slide-in': 'slide-in 0.4s ease-out',
				'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
				'scale-in': 'scale-in 0.2s ease-out',
				'float': 'float 3s ease-in-out infinite',
				'first': "moveVertical 30s ease infinite",
				'second': "moveInCircle 20s reverse infinite",
				'third': "moveInCircle 40s linear infinite",
				'fourth': "moveHorizontal 40s ease in	finite",
				'fifth': "moveInCircle 20s ease infinite",
				'skaker': "shake 0.7s ease infinite"
				
			},
			backdropFilter: {
				'none': 'none',
				'blur': 'blur(20px)'
			},
			transitionProperty: {
				'height': 'height',
				'spacing': 'margin, padding',
				'width': 'width',
				'border': 'border-radius, border-width',
				'colors': 'color, background-color, border-color, text-decoration-color, fill, stroke'
			}
		}
	},
	plugins: [require("tailwindcss-animate"),require('tailwindcss-motion')],
} satisfies Config;
