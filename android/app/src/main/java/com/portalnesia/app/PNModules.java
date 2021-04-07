package com.portalnesia.app;

//import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
//import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Promise;

import java.util.HashMap;
import java.util.Map;

public class PNModules extends ReactContextBaseJavaModule {
    PNModules(ReactApplicationContext context) {
        super(context);
    }

    @Override
    public String getName() {
        return "Portalnesia";
    }

    @Override
    public Map<String,Object> getConstants(){
        final Map<String,Object> constants = new HashMap<>();
        constants.put("URL", "https://portalnesia.com");
        return constants;
    }
}
