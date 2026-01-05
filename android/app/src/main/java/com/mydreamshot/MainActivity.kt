package com.mydreamshot

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
<<<<<<< HEAD
import android.os.Bundle
import com.zoontek.rnbootsplash.RNBootSplash

class MainActivity : ReactActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
    RNBootSplash.init(this, R.style.BootTheme) // ⬅️ initialize the splash screen
    super.onCreate(savedInstanceState) // super.onCreate(null) with react-native-screens
  }

=======
import android.os.Bundle // 👈 Import Bundle for onCreate

class MainActivity : ReactActivity() {

>>>>>>> c3e44579ef282871bf4e45907a5f92b2fa97d903
  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "Mydreamshot"

<<<<<<< HEAD
=======
  // 👇 ADD THIS METHOD TO FIX THE THEME HANDOFF ISSUE
  override fun onCreate(savedInstanceState: Bundle?) {
    // 1. Set the MAIN application theme (AppTheme)
    // This switches from the temporary SplashTheme defined in AndroidManifest.xml
    setTheme(R.style.AppTheme)
    
    // 2. Call super.onCreate()
    super.onCreate(null) // Passing null is common for React Native activities
  }
  // 👆 END OF FIX

>>>>>>> c3e44579ef282871bf4e45907a5f92b2fa97d903
  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
<<<<<<< HEAD
}
=======
}
>>>>>>> c3e44579ef282871bf4e45907a5f92b2fa97d903
